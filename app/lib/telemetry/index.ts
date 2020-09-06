import { inspect } from "util";
import { getKustoSender } from "./kusto";

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
    payload: any;
}

export interface TimingPayload {
    start: Date;
    end: Date;
    duration: number;
    [extraProps: string]: any;
}

export interface Logger {
    debug: (payload: any, action?: string) => void;
    info: (payload: any, action?: string) => void;
    timing: (payload: TimingPayload, action?: string) => void;
    warn: (payload: any, action?: string) => void;
    error: (payload: any, action?: string) => void;
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

const { KUSTO_EVENTHUB_CONNECTION_STRING, KUSTO_EVENTHUB_NAME } = process.env;

class LoggerImpl implements Logger {
    private static readonly kustoSender = getKustoSender({
        connectionString: KUSTO_EVENTHUB_CONNECTION_STRING!,
        eventHubName: KUSTO_EVENTHUB_NAME!
    }).then(sender => {
        console.log("Successfully acquired Kusto Sender");
        return sender;
    });
    constructor(private readonly area: string) {}

    public debug = (payload: any, action?: string) =>
        this.trace(TraceLevel.Debug, action, payload);
    public info = (payload: any, action?: string) =>
        this.trace(TraceLevel.Info, action, payload);
    public timing = (payload: TimingPayload, action?: string) =>
        this.trace(TraceLevel.Timing, action, payload);
    public warn = (payload: any, action?: string) =>
        this.trace(TraceLevel.Warn, action, payload);
    public error = (payload: any, action?: string) =>
        this.trace(TraceLevel.Error, action, payload);

    private trace(level: TraceLevel, action: string | undefined, payload: any) {
        // Using inspect instead of JSON.stringify because inspect doesn't throw on circular references, just handles thems
        consoleLogMap[level](
            `[${new Date().toLocaleString()}] [${level}] ${inspect(payload)}`
        );

        LoggerImpl.kustoSender.then(sender => {
            sender.send({
                area: this.area,
                action: action || "Log",
                level,
                payload
            });
        });
    }
}
