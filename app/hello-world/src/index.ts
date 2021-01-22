import express from "express";
import { createCluster } from "lib/cluster";
import { requestTime } from "lib/telemetry/util";
import { getLogger } from "lib/telemetry";
import { ServiceHealthRating, withHealthEndpoint } from "lib/health";

createCluster(initWorker);

async function initWorker() {
    const PORT = 5000;

    const app = express();
    app.use(requestTime);
    withHealthEndpoint(app, () => ({ rating: ServiceHealthRating.GREEN }));

    app.listen(PORT, () => {
        getLogger("HelloWorld.Init").info(
            "HelloWorld successfully started",
            "Listen"
        );
    });
}
