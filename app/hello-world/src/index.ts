import express from "express";
import { createCluster } from "lib/cluster";
import { requestTime } from "lib/telemetry/util";
import { getLogger } from "lib/telemetry";

createCluster(initWorker);

async function initWorker() {
    const PORT = 5000;

    const app = express();
    app.use(requestTime);

    app.listen(PORT, () => {
        getLogger("HelloWorld.Init").info(
            "Listen",
            "HelloWorld successfully started"
        );
    });
}
