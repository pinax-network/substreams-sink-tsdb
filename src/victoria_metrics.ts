import { Clock } from "substreams";
import { logger, register } from "substreams-sink-prometheus"

export function appendEpoch(metrics: string, epoch: number) {
    const separator = "\n";
    return metrics.split(separator).map(line => {
        if (line == "" || line[0] =='#') return line // comment or empty line
        return `${line} ${epoch}`
    }).join(separator);
}

export async function handleImport(url: string, scrape_interval: number, clock: Clock) {
    if ( !clock.timestamp ) return; // no timestamp (yet
    const epoch = clock.timestamp.toDate().valueOf();
    if ( epoch / 1000 % scrape_interval != 0 ) return; // only handle epoch intervals
    const metrics = await register.metrics();
    const body = appendEpoch(metrics, epoch);
    await fetch(url, { method: 'POST', body }).catch((error) => {
        logger.error(error)
    });
}
