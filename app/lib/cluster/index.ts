import cluster from "cluster";
import os from "os";
import { getLogger } from "lib/telemetry";

export function createCluster(
    initWorker: () => Promise<void>,
    workers?: number
): Promise<void> | undefined {
    const logger = getLogger("SDK.Cluster");

    if (cluster.isMaster) {
        logger.info(`Main process ${process.pid} started`);

        workers = workers || os.cpus().length;
        logger.info(`Creating a Node cluster with ${workers} workers`);
        for (let i = 0; i < workers; i++) {
            cluster.fork();
        }

        cluster.on("exit", worker => {
            logger.info(`Worker ${worker.id} died; replacing`);
            cluster.fork();
        });
    } else {
        return initWorker().then(x =>
            logger.info(`Successfully started worker ${cluster.worker.id}`)
        );
    }
}
