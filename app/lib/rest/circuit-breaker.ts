import { AxiosResponse } from "axios";
import { getLogger } from "lib/telemetry";

export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeoutInMs: number;

    onBreakerStateChange?: (state: BreakerState) => void;
}

const enum BreakerState {
    GREEN = "green",
    YELLOW = "yellow",
    RED = "red"
}

export function withCircuitBreaker<
    T extends (...args: any[]) => Promise<AxiosResponse>
>(
    func: T,
    config: CircuitBreakerConfig
): (...funcArgs: Parameters<T>) => Promise<AxiosResponse> {
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

        if (response.status == 200) {
            onSuccess();
        } else {
            onFailure();
        }

        return response;
    };
}

export function logBreakerChange(
    area: string,
    action?: string
): NonNullable<CircuitBreakerConfig["onBreakerStateChange"]> {
    const logger = getLogger(area);

    return state => {
        switch (state) {
            case BreakerState.GREEN:
                logger.info(
                    {
                        message: "Circuit breaker now healthy",
                        breakerState: state
                    },
                    action
                );
                break;
            case BreakerState.YELLOW:
                logger.info(
                    {
                        message: "Circuit breaker entered probing mode",
                        breakerState: state
                    },
                    action
                );
                break;
            case BreakerState.RED:
                logger.warn(
                    {
                        message: "Circuit breaker activated",
                        breakerState: state
                    },
                    action
                );
                break;
        }
    };
}
