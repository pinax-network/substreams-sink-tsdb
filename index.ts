import { download, createHash, Clock, PrometheusOperations } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import pkg from "./package.json";

import { VictoriaMetrics } from "./src/victoria_metrics";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default user options
export const DEFAULT_USERNAME = '';
export const DEFAULT_PASSWORD = '';
export const DEFAULT_ADDRESS = 'localhost';
export const DEFAULT_PORT = 8428;
export const DEFAULT_SCRAPE_INTERVAL = 30;
export const TYPE_NAME = 'pinax.substreams.sink.prometheus.v1.PrometheusOperations';

// Custom user options interface
interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    username: string;
    password: string;
    scrape_interval: number;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams and create hash
    const spkg = await download(manifest);
    const hash = createHash(spkg);

    // Get command options
    const { address, port, username, password, scrape_interval } = options;

    // Initialize VictoriaMetrics
    const victoria = new VictoriaMetrics(username, password, address, port, scrape_interval);
    await victoria.init();
    console.log(`Connecting to VictoriaMetrics: ${address}:${port}`);

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (message: PrometheusOperations, clock: Clock, typeName: string) => {
        if ( typeName != TYPE_NAME ) return;
        const headers = { clock, hash, typeName };
        victoria.sendToQueue(message, headers);
    });
    substreams.start(options.delayBeforeStart);
}