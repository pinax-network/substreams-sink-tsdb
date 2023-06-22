import { download, createHash } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";
import pkg from "./package.json";

import { handleImport } from "./src/victoria_metrics";
import { collectDefaultMetrics, handleClock, handleManifest, handleOperations, setDefaultLabels } from "substreams-sink-prometheus";

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
export interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    scrapeInterval: number;
    labels: Object;
    collectDefaultMetrics: boolean;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Get command options
    const { address, port, scrapeInterval } = options;
    const url = `http://${address}:${port}/api/v1/import/prometheus`

    // Set default labels
    if (options.collectDefaultMetrics) collectDefaultMetrics(options.labels);
    if (options.labels) setDefaultLabels(options.labels);

    // Download substreams
    const spkg = await download(manifest);
    const hash = createHash(spkg);
    logger.info("download", { manifest, hash });

    // Run substreams
    const substreams = run(spkg, moduleName, options);
    handleManifest(substreams, manifest, hash);
    substreams.on("anyMessage", handleOperations);
    substreams.on("clock", clock => {
        handleClock(clock);
        handleImport(url, scrapeInterval, clock);
    });
    substreams.start(options.delayBeforeStart);
}