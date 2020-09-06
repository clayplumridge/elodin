import express from "express";
import { createCluster } from "lib/cluster";
import { requestTime } from "lib/telemetry/util";

createCluster(initWorker);

async function initWorker() {
    const PORT = 5000;

    const app = express();
    app.use(requestTime);

    app.listen(PORT, () => {
        console.log("server started at http://localhost:" + PORT);
    });
}
