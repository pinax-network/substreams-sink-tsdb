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

export async function handleImport(url: string, scrape_interval: number, clock: Clock) {
    if (!clock.timestamp) return;
    const { nanos, seconds } = clock.timestamp;
    const epoch = Number(seconds);
    if ( nanos != 0 ) return; // skip blocks with partial timestamps
    if ( epoch % scrape_interval != 0 ) return; // only handle epoch intervals
    logger.info("import", {epoch, clock});
    const data = await fetchMetrics(epoch);
    const response = await fetch(url, {
        method: 'POST',
        body: data
    });
    logger.info("response", {response});
}

