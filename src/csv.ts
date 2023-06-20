import { run, logger, RunOptions } from "substreams-sink";
import { handleClock, handleManifest, handleOperations } from "substreams-sink-prometheus";
import { download, createHash } from "substreams";
import { register } from "substreams-sink-prometheus"
import { Clock } from "substreams";
import * as fs from 'fs';

const EPOCH_HEADER = "#epoch"

export interface ActionOptions extends RunOptions {
    address: string;
    port: number;
    scrape_interval: number;
    labels: Record<string, string>;
    collectDefaultMetrics: boolean;
    csv_root: string;
}

function getCsvRoot(rootValue: string) {
    if (rootValue.length === 0) {
        return "."
    }
    return rootValue.endsWith("/") ? rootValue.substring(0, rootValue.length - 1) : rootValue
}

export async function actionExportCsv(manifest: string, moduleName: string, options: ActionOptions) {

    function padNumber(num: number, size: number) {
        const p: string[] = []
        const numStr = num.toString()
        while (p.length + numStr.length < size) {
            p.push("0")
        }
        p.push(numStr)
        return p.join("");
    }

    function extractMetrics(metrics: string, epoch: number): string[] {
        const separator = "\n";
        const lines = metrics.trim().split(separator)
            .filter(line => line.length !== 0
                && !line.startsWith('#') && !line.startsWith("manifest")) // comment or empty line
        const header: string[] = [EPOCH_HEADER]
        const values: string[] = [epoch.toString()]
        lines.map(function (val, _index) {
            const el = val.split(" ", 2)
            header.push(el[0])  // metric_name
            values.push(el[1])  // value
        })
        return [header.join(","), values.join(",")]
    }

    async function handleExport(url: string, scrape_interval: number, clock: Clock) {
        logger.info(`*** handleExport ${scrape_interval}`)
        const block_num = Number(clock.number);

        if (!clock.timestamp) return; // no timestamp yet
        const epoch = clock.timestamp.toDate().valueOf();
        logger.info(`*** handleExport epoch ${epoch / 1000}`)
        if (epoch / 1000 % scrape_interval != 0) return; // only handle epoch intervals
        const metrics = await register.metrics();
        const csvData = extractMetrics(metrics, epoch)

        // compute target path
        const block_folder = Math.floor(block_num / blockGranular) * blockGranular
        const block_folder_path = padNumber(block_folder, 10)
        const outPath = `${csvPath}/${block_folder_path}`
        const outFilePath = `${outPath}/metrics.csv`

        // create path if not exists
        if (!fs.existsSync(outPath)) {
            fs.mkdirSync(outPath, { recursive: true });
        }

        try {
            if (!fs.existsSync(outFilePath)) {
                // write header + 1st line
                fs.writeFileSync(outFilePath, csvData.join("\n") + "\n");
            } else {
                // append new csv line
                fs.appendFileSync(outFilePath, csvData[1] + "\n", "utf-8");
            }
            // file written successfully
        } catch (err) {
            console.error(err);
        }

        logger.info(metrics)
        console.log(metrics)
    }

    // Get command options
    const { address, port, scrape_interval } = options;

    logger.info(`manifest: ${manifest} moduleName: ${moduleName}`)
    logger.info(`options: ${options}`)

    logger.info(`vitals: ${address} ${port} ${scrape_interval}`)
    const url = `http://${address}:${port}/api/v1/import/prometheus`

    // Download substreams
    const spkg = await download(manifest);
    const hash = createHash(spkg);
    logger.info("download", { manifest, hash });

    // Csv root
    const blockGranular = 1000;
    const csvRoot = getCsvRoot(options.csv_root)
    const csvPath = `${csvRoot}/${hash}`;

    // Run substreams
    const substreams = run(spkg, moduleName, options);
    handleManifest(substreams, manifest, hash);
    substreams.on("anyMessage", handleOperations);
    substreams.on("clock", clock => {
        const block_num = Number(clock.number);
        handleClock(clock);
        handleExport(url, scrape_interval, clock);
    });
    substreams.start(options.delayBeforeStart);

    console.log(options)
}

export async function actionImportCsv(options: ActionOptions) {
    console.log(options)
    const csvRoot = getCsvRoot(options.csv_root)
    const { address, port } = options;

    async function processMetrics(filePath: string) {
        const separator = "\n";
        const csvSeparator = ","
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const lines = csvData.trim().split(separator)

        // check if there is one line of data
        if (lines.length > 2) {
            const headers = lines[0].split(csvSeparator)
            console.log(`headers: ${headers}`)
            lines.shift()  // remove 1st line (headers)

            // create header mapping for metrics
            const mapping: string[] = []
            let col = 1
            for (const header of headers) {
                if (header == EPOCH_HEADER) {
                    mapping.push(`${col}:time:unix_ms`)
                } else {
                    mapping.push(`${col}:metric:${header}`)
                }
                ++col
            }

            // inject labels
            const injectedLabelValues: string[] = [];
            for (const label in options.labels) {
                mapping.push(`${col}:label:${label}`)
                injectedLabelValues.push(options.labels[label])
                ++col
            }

            // create request body
            const injectedLabels = injectedLabelValues.join(csvSeparator)
            const body = lines.map(function (line, _index) {
                return injectedLabels.length !== 0 ? `${line}${csvSeparator}${injectedLabels}` : line
            }).join(separator)

            const url = `http://${address}:${port}/api/v1/import/csv?format=` + mapping.join(csvSeparator)
            console.log(`URL: ${url}`)
            console.log(`BODY: ${body}`)
            await fetch(url, { method: 'POST', body }).catch((error) => {
                logger.error(error)
            });
        }
    }

    async function SearchSubFolders(root: string) {
        fs.readdirSync(root).forEach(object => {
            if (object != "." && object != "..") {
                const path = `${root}/${object}`
                if (fs.lstatSync(path).isDirectory()) {
                    SearchSubFolders(path)
                } else if (fs.lstatSync(path).isFile() && path.endsWith(".csv")) {
                    processMetrics(path)
                }
            }
        });
    }
    await SearchSubFolders(csvRoot)
}