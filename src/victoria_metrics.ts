import { Clock } from "substreams";
import { logger, register } from "substreams-sink-prometheus"

export async function fetchMetrics(epoch: number):Promise<string> {
    const metrics =  await register.metrics()
    const arr = [];
    const lines = metrics.split("\n")
    for ( const line of lines ) {
        if (line == "" || line[0] =='#') {
            arr.push(line)
            continue
        }
        arr.push(`${line} ${epoch}`)
    }
    return arr.join('\n')
}

export function toEpoch(clock: Clock): number {
    if (!clock.timestamp) return 0;
    const { nanos, seconds } = clock.timestamp;
    return Number(seconds) * 1000 + Math.floor(nanos / 1000000);
}

export async function handleImport(url: string, scrape_interval: number, clock: Clock) {
    const epoch = toEpoch(clock);
    if ( epoch / 1000 % scrape_interval != 0 ) return; // only handle epoch intervals
    logger.info("import", {epoch, clock});
    const body = await fetchMetrics(epoch);
    await fetch(url, { method: 'POST', body });
}

