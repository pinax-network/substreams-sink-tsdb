import { download, Clock, PrometheusOperations } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import pkg from "./package.json";

import { handleImport } from "./src/victoria_metrics";
import { handleOperations } from "substreams-sink-prometheus";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default user options
export const DEFAULT_ADDRESS = 'localhost';
export const DEFAULT_PORT = 8428;
export const DEFAULT_SCRAPE_INTERVAL = 30;
export const TYPE_NAME = 'pinax.substreams.sink.prometheus.v1.PrometheusOperations';

// Custom user options interface
export interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    scrape_interval: number;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);

    // Get command options
    const { address, port, scrape_interval } = options;
    const url = `http://${address}:${port}/api/v1/import/prometheus`

    // Run substreams
    const substreams = run(spkg, moduleName, options);

    substreams.on("anyMessage", async (message: PrometheusOperations, clock: Clock, typeName: string) => {
        if ( typeName != TYPE_NAME ) return;
        handleOperations(message);
        handleImport(url, scrape_interval, clock);
    });
    substreams.start(options.delayBeforeStart);
}