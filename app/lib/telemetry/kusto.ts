import { EventHubProducerClient, EventDataBatch } from "@azure/event-hubs";
import { Trace } from ".";

interface KustoSenderConfig {
    connectionString: string;
    eventHubName: string;

    /**
     * Default 10
     */
    batchSize?: number;
}

let kustoSender: KustoSender | undefined;
export function getKustoSender(config: KustoSenderConfig): KustoSender {
    if (!kustoSender) {
        kustoSender = new KustoSender(config);
    }

    return kustoSender;
}

class KustoSender {
    private currentBatch: EventDataBatch | undefined = undefined;
    private readonly producerClient: EventHubProducerClient;

    constructor(private readonly config: KustoSenderConfig) {
        this.producerClient = new EventHubProducerClient(
            config.connectionString,
            config.eventHubName
        );
    }

    public async send(trace: Trace): Promise<void> {
        if (!this.currentBatch) {
            this.currentBatch = await this.producerClient.createBatch();
        }

        this.currentBatch.tryAdd({ body: trace });

        if (this.currentBatch.count >= (this.config.batchSize || 10)) {
            await this.producerClient.sendBatch(this.currentBatch);
            this.currentBatch = await this.producerClient.createBatch();
        }
    }
}
