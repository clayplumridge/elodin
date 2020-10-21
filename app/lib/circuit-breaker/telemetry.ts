import { getLogger } from "lib/telemetry";
import { BreakerState, CircuitBreakerConfig } from ".";

export function logBreakerChange(
    area: string,
    action?: string
): NonNullable<CircuitBreakerConfig<unknown>["onBreakerStateChange"]> {
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
