import { Clock } from "substreams";
import { logger, register } from "substreams-sink-prometheus"

export async function fetchMetrics(epoch: number, injectedLabels: string):Promise<string> {
    const metrics =  await register.metrics()
    const arr = [];
    const lines = metrics.split("\n")
    for ( const line of lines ) {
        if (line == "" || line[0] =='#') {
            arr.push(line)
            continue
        }
        const mline = line.includes('{') ?
            line.replace("}", `, ${injectedLabels} }`):
            line.replace(" ", ` { ${injectedLabels} }`);
        arr.push(`${mline} ${epoch}`)
    }
    return arr.join('\n')
}

export async function handleImport(url: string, scrape_interval: number, injectedLabels: string, clock: Clock) {
    if ( !clock.timestamp ) return; // no timestamp (yet
    const epoch = clock.timestamp.toDate().valueOf();
    if ( epoch / 1000 % scrape_interval != 0 ) return; // only handle epoch intervals
 //   logger.info("import", {epoch, clock});
    const body = await fetchMetrics(epoch, injectedLabels);
    await fetch(url, { method: 'POST', body }).catch((error) => {
        logger.error(error)
    });
}
