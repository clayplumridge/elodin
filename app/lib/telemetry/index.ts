import { inspect } from "util";

export const enum TraceLevel {
    Debug = "debug",
    Timing = "timing",
    Info = "info",
    Warn = "warn",
    Error = "error"
}

export interface Trace {
    level: TraceLevel;
    area: string;
    action: string;
    requestContext: {}; // TODO: RequestContext impl
    payload: any;
}

export interface TimingPayload {
    start: Date;
    end: Date;
    duration: number;
    [extraProps: string]: any;
}

export interface Logger {
    debug: (action: string, payload: any) => void;
    info: (action: string, payload: any) => void;
    timing: (action: string, payload: TimingPayload) => void;
    warn: (action: string, payload: any) => void;
    error: (action: string, payload: any) => void;
}

const memoizedLoggers: Record<string, Logger> = {};
export function getLogger(area: string): Logger {
    if (!memoizedLoggers[area]) {
        memoizedLoggers[area] = new LoggerImpl(area);
    }
    return memoizedLoggers[area];
}

const consoleLogMap: Record<TraceLevel, (message: string) => void> = {
    debug: console.log,
    timing: console.log,
    info: console.log,
    warn: console.warn,
    error: console.error
};

class LoggerImpl implements Logger {
    constructor(private readonly area: string) {}

    public debug = (action: string, payload: any) =>
        this.trace(TraceLevel.Debug, action, payload);
    public info = (action: string, payload: any) =>
        this.trace(TraceLevel.Info, action, payload);
    public timing = (action: string, payload: TimingPayload) =>
        this.trace(TraceLevel.Timing, action, payload);
    public warn = (action: string, payload: any) =>
        this.trace(TraceLevel.Warn, action, payload);
    public error = (action: string, payload: any) =>
        this.trace(TraceLevel.Error, action, payload);

    private trace(level: TraceLevel, action: string, payload: any) {
        // Using inspect instead of JSON.stringify because inspect doesn't throw on circular references, just handles thems
        consoleLogMap[level](
            `[${new Date().toLocaleString()}] [${level}] ${inspect(payload)}`
        );

        // TODO: Send to Kusto
    }
}
