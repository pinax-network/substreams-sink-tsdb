import { createHash } from "substreams";
//import { run, logger, cli } from "substreams-sink";
import { commander, setup } from "substreams-sink";
import { logger } from "substreams-sink";
import pkg from "./package.json";
import { fetchSubstream } from "@substreams/core";
import { handleImport } from "./src/victoria_metrics";
//import { collectDefaultMetrics, handleClock, handleManifest, handleOperations, setDefaultLabels } from "substreams-sink-prometheus";
import { handleOperation, register } from "./src/prom";

logger.setName(pkg.name);
export { logger };

// default user options
export const DEFAULT_ADDRESS = '0.0.0.0';
export const DEFAULT_PORT = 8428;
export const DEFAULT_SCRAPE_INTERVAL = 30;
export const TYPE_NAME = 'pinax.substreams.sink.prometheus.v1.PrometheusOperations';
export const DEFAULT_COLLECT_DEFAULT_METRICS = false;
export const DEFAULT_CSV_ROOT = './csv'
export const DEFAULT_FOLDER_GRANULAR = 1000
export const DEFAULT_FILE_GRANULAR = 100

// Custom user options interface
export interface ActionOptions extends commander.RunOptions {
    address: string;
    port: number;
    scrapeInterval: number;
    labels: Object;
    collectDefaultMetrics: boolean;
    manifest: string
}

export async function action(options: ActionOptions) {
    // Get command options
    const { address, port, scrapeInterval } = options;
    const url = `http://${address}:${port}/api/v1/import/prometheus`

    // Set default labels
    // if (options.collectDefaultMetrics) collectDefaultMetrics(options.labels);
    // if (options.labels) setDefaultLabels(options.labels);

    // Download substreams
    const spkg = await fetchSubstream(options.manifest);
    const hash = createHash(spkg.toBinary());
    logger.info("download", options.manifest, hash);

    // Run substreams
    //const substreams = run(spkg, options);
    //handleManifest(substreams, options.manifest, hash);
    const emitter = await setup(options, pkg);
    emitter.on("anyMessage", (message, cursor, clock) => {
        //substreams.on("anyMessage", async (messages: any, _: any, clock: any) => {
        //  handleClock(clock);
        handleImport(url, scrapeInterval, clock);
        handleOperation(message);
    });

    //substreams.on("anyMessage", handleOperations);
    /*substreams.on("clock", clock => {
        handleClock(clock);
        handleImport(url, scrapeInterval, clock);
    });*/
    //  substreams.start(options.delayBeforeStart);
}