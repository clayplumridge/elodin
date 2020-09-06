import cluster from "cluster";
import os from "os";

export function createCluster(
    initWorker: () => Promise<void>,
    workers?: number
): Promise<void> | undefined {
    if (cluster.isMaster) {
        console.log(`Master process ${process.pid} started`);

        workers = workers || os.cpus().length;
        for (let i = 0; i < workers; i++) {
            cluster.fork();
        }

        cluster.on("exit", worker => {
            console.log(`Worker ${worker.id} died; replacing`);
            cluster.fork();
        });
    } else {
        return initWorker().then(x =>
            console.log(`Successfully started worker ${cluster.worker.id}`)
        );
    }
}
