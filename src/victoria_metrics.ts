import { logger } from "substreams-sink";
import { register } from "./prom.js"

export function appendEpoch(metrics: string, epoch: number) {
    const separator = "\n";
    const lines = metrics.split(separator)
        .filter(line => line.length !== 0
            && !line.startsWith('#')) // comment or empty line
    lines.push("")
    return lines.join(` ${epoch}${separator}`);
}

export async function handleImport(url: string, scrapeInterval: number, clock: any) {
    logger.info("handleImport")

    if (!clock.timestamp) return; // no timestamp (yet
    const epoch = clock.timestamp.toDate().valueOf();
    if (epoch / 1000 % scrapeInterval != 0) return; // only handle epoch intervals
    const metrics = await register.metrics();
    const body = appendEpoch(metrics, epoch);
    await fetch(url, { method: 'POST', body }).catch((error) => {
        logger.error(error)
    });
}
