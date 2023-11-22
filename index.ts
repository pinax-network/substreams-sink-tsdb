import { commander, setup, logger } from "substreams-sink";
import { fetchSubstream, createHash } from "@substreams/core";
import { handleImport } from "./src/victoria_metrics.js";
import { handleOperations } from "./src/prom.js";

import pkg from "./package.json" assert { type: "json" };

logger.setName(pkg.name);
export { logger };

// default user options
export const DEFAULT_HOST = 'http://0.0.0.0:8428'
export const DEFAULT_SCRAPE_INTERVAL = 30;
export const DEFAULT_COLLECT_DEFAULT_METRICS = false;
export const DEFAULT_CSV_ROOT = './csv'
export const DEFAULT_FOLDER_GRANULAR = 1000
export const DEFAULT_FILE_GRANULAR = 100
export const DEFAULT_VERBOSE = false

// Custom user options interface
export interface ActionOptions extends commander.RunOptions {
    host: string;
    scrapeInterval: number;
    labels: Object;
    manifest: string
}

export async function action(options: ActionOptions) {
    const url = `${options.host}/api/v1/import/prometheus`
    logger.info("url", url)

    // Download substreams
    const spkg = await fetchSubstream(options.manifest);
    const hash = createHash(spkg.toBinary());
    logger.info("download", options.manifest, hash);

    // Run substreams
    const { emitter } = await setup(options);
    emitter.on("anyMessage", (messages, _cursor, clock) => {
        handleImport(url, options.scrapeInterval, clock);
        handleOperations(messages as any);
    });

    // Start streaming
    emitter.start();
}