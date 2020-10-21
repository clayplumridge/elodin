export interface CircuitBreakerConfig<T> {
    failureThreshold: number;
    successThreshold: number;
    timeoutInMs: number;

    validateResult?: (result: T) => boolean;
    onBreakerStateChange?: (state: BreakerState) => void;
}

export const enum BreakerState {
    GREEN = "green",
    YELLOW = "yellow",
    RED = "red"
}

type Unwrap<T> = T extends Promise<infer U> ? U : T;

export function withCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
    func: T,
    config: CircuitBreakerConfig<Unwrap<ReturnType<T>>>
): (...funcArgs: Parameters<T>) => Promise<Unwrap<ReturnType<T>>> {
    let successCount = 0;
    let failureCount = 0;
    let breakerState = BreakerState.GREEN;
    let nextAttempt = Date.now();

    function onSuccess() {
        failureCount = 0;

        if (breakerState == BreakerState.YELLOW) {
            successCount += 1;

            if (successCount > config.successThreshold) {
                breakerState = BreakerState.GREEN;
                config.onBreakerStateChange?.(breakerState);
            }
        }
    }

    function onFailure() {
        failureCount += 1;
        if (failureCount >= config.failureThreshold) {
            breakerState = BreakerState.RED;
            config.onBreakerStateChange?.(breakerState);
            nextAttempt = Date.now() + config.timeoutInMs;
            successCount = 0;
        }
    }

    async function exec(...args: Parameters<T>) {
        if (breakerState == BreakerState.RED) {
            if (Date.now() >= nextAttempt) {
                breakerState = BreakerState.YELLOW;
                config.onBreakerStateChange?.(breakerState);
            } else {
                throw new Error(
                    "Circuit breaker suspended; try a fallback or report an error"
                );
            }
        }

        return await func(args);
    }

    return async (...args: Parameters<T>) => {
        const response = await exec(...args);

        if (!config.validateResult || config.validateResult(response)) {
            onSuccess();
        } else {
            onFailure();
        }

        return response;
    };
}
