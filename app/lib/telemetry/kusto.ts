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

export async function getKustoSender(config: KustoSenderConfig) {
    const batchSize = config.batchSize || 10;
    const producerClient = new EventHubProducerClient(
        config.connectionString,
        config.eventHubName
    );

    let currentBatch = await producerClient.createBatch();

    return {
        async send(trace: Trace) {
            currentBatch.tryAdd({ body: trace });

            if (currentBatch.count >= batchSize) {
                await producerClient.sendBatch(currentBatch);
                currentBatch = await producerClient.createBatch();
            }
        }
    };
}
