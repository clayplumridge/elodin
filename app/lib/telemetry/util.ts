import express from "express";
import { getLogger } from ".";

export function requestTime(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    const requestTime = Date.now();

    res.on("finish", () => {
        const endTime = Date.now();
        const duration = endTime - requestTime;

        getLogger("Express.Request").timing("Timings", {
            route: req.url,
            start: new Date(requestTime),
            end: new Date(endTime),
            duration
        });
    });

    next();
}

export function withTiming<T extends (...args: any[]) => any>(
    func: T,
    area: string,
    action: string
): (...funcArgs: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
        const start = Date.now();
        const result = func(args);
        const end = Date.now();
        const duration = end - start;

        getLogger(area).timing(action, {
            start: new Date(start),
            end: new Date(end),
            duration
        });

        return result;
    };
}
