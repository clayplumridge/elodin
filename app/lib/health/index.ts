import { Express } from "express";
import { getLogger, Logger } from "lib/telemetry";

export const enum ServiceHealthRating {
    GREEN = 0,
    YELLOW = 1,
    RED = 2
}

export interface ServiceHealth {
    rating: ServiceHealthRating;
    message?: string;
    [additionalProps: string]: any;
}

const healthToLoggerMap: Record<
    ServiceHealthRating,
    (logger: Logger, payload: any) => void
> = {
    [ServiceHealthRating.GREEN]: (logger, payload) => logger.info(payload),
    [ServiceHealthRating.YELLOW]: (logger, payload) => logger.warn(payload),
    [ServiceHealthRating.RED]: (logger, payload) => logger.error(payload)
};

export function withHealthEndpoint(
    app: Express,
    healthEvaluation: () => ServiceHealth
) {
    const logger = getLogger("Elodin.Health");

    app.get("/_health", (req, res) => {
        const health = healthEvaluation();
        healthToLoggerMap[health.rating](logger, health);

        res.send(health);
    });
}
