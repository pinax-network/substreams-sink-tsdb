import { download, createHash } from "substreams";
import { run, logger, RunOptions } from "substreams-sink";

import pkg from "./package.json";

import { handleImport } from "./src/victoria_metrics";
import { handleClock, handleManifest, handleOperations } from "substreams-sink-prometheus";

logger.defaultMeta = { service: pkg.name };
export { logger };

// default user options
export const DEFAULT_ADDRESS = '127.0.0.1';
export const DEFAULT_PORT = 8428;
export const DEFAULT_SCRAPE_INTERVAL = 30;
export const TYPE_NAME = 'pinax.substreams.sink.prometheus.v1.PrometheusOperations';

// Custom user options interface
export interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    scrape_interval: number;
    injectedLabels: string;  // -j 'job="something",blah="test"'
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download substreams
    const spkg = await download(manifest);
    const hash = createHash(spkg);
    logger.info("download", {manifest, hash});

    // Get command options
    const { address, port, scrape_interval, injectedLabels} = options;
    const url = `http://${address}:${port}/api/v1/import/prometheus`
    //const injectedLabels = `job="${job}", network="${network}"`
    if (injectedLabels === '') {
        throw "InjectedLabels not defined. Missing -j 'job=\"something\"'";
    }

    // Run substreams
    const substreams = run(spkg, moduleName, options);
    handleManifest(substreams, manifest, hash);
    substreams.on("anyMessage", handleOperations);
    substreams.on("clock", clock => {
        handleClock(clock);
        handleImport(url, scrape_interval, injectedLabels, clock);
    });
    substreams.start(options.delayBeforeStart);
}