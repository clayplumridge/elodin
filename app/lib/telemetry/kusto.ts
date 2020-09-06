import { EventHubProducerClient } from "@azure/event-hubs";
import { Trace } from ".";

interface KustoSenderConfig {
    connectionString: string;
    eventHubName: string;

    /**
     * Default 10
     */
    batchSize?: number;
}

interface KustoSender {
    send(trace: Trace): Promise<void>;
}

let kustoSender: KustoSender | undefined;
export async function getKustoSender(
    config: KustoSenderConfig
): Promise<KustoSender> {
    if (!kustoSender) {
        const batchSize = config.batchSize || 10;
        const producerClient = new EventHubProducerClient(
            config.connectionString,
            config.eventHubName
        );

        let currentBatch = await producerClient.createBatch();

        kustoSender = {
            async send(trace: Trace) {
                currentBatch.tryAdd({ body: trace });

                if (currentBatch.count >= batchSize) {
                    await producerClient.sendBatch(currentBatch);
                    currentBatch = await producerClient.createBatch();
                }
            }
        };
    }

    return kustoSender;
}
