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
    scrapeInterval: number;
    labels: Record<string, string>;
    collectDefaultMetrics: boolean;
    csvRoot: string;
    folderGranular: number;
    fileGranular: number;
}

function getCsvRoot(rootValue: string) {
    if (rootValue.length === 0) {
        return "."
    }
    return rootValue.endsWith("/") ? rootValue.substring(0, rootValue.length - 1) : rootValue
}

//////////////////////////////////////////////////////////
// ExportCSV

export async function actionExportCsv(manifest: string, moduleName: string, options: ActionOptions) {

    // pad a number on a fixed number of positions
    function padNumber(num: number, size: number) {
        const p: string[] = []
        const numStr = num.toString()
        while (p.length + numStr.length < size) {
            p.push("0")
        }
        p.push(numStr)
        return p.join("");
    }

    // extract metrics and headers
    function extractMetrics(metrics: string, epoch: number): string[] {
        const lineSeparator = "\n";
        const lines = metrics.trim().split(lineSeparator)
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

    function writeCsvRowsToFile() {
        if (lastFileRef.length !== 0) {
            fs.writeFileSync(lastFileRef, fileRows.join("\n"));
        }
    }

    async function handleExport(scrapeInterval: number, clock: Clock) {
        logger.info(`*** handleExport ${scrapeInterval}`)
        const block_num = Number(clock.number);

        if (!clock.timestamp) return; // no timestamp yet
        const epoch = clock.timestamp.toDate().valueOf();
        if (epoch / 1000 % scrapeInterval != 0) return; // only handle epoch intervals
        const metrics = await register.metrics();
        const csvData = extractMetrics(metrics, epoch)

        // compute target path
        const block_folder = Math.floor(block_num / folderGranular) * folderGranular
        const block_folder_path = padNumber(block_folder, 10)
        const outPath = `${csvPath}/${block_folder_path}`
        const fileId = Math.floor(block_num / fileGranular) * fileGranular
        const outFilePath = `${outPath}/metrics-${fileId}.csv`

        // create path if not exists
        if (lastPathRef != outPath) {
            if (!fs.existsSync(outPath)) {
                fs.mkdirSync(outPath, { recursive: true });
            } else {
                if (!fs.lstatSync(outPath).isDirectory()) {
                    throw new Error(`${outPath} is not a folder.`)
                }
            }
            lastPathRef = outPath
        }

        try {
            if (lastFileRef != outFilePath) {
                writeCsvRowsToFile();
                lastFileRef = outFilePath
                fileRows = [csvData[0]] // csv header
            }
            fileRows.push(csvData[1]) // csv data
        } catch (err) {
            logger.error(err);
        }
    }

    // Get command options
    const { address, port, scrapeInterval } = options;

    logger.info(`manifest: ${manifest} moduleName: ${moduleName}`)
    logger.info("options:", options)
    console.log(options)

    logger.info(`vitals: ${address} ${port} ${scrapeInterval}`)

    // Download substreams
    const spkg = await download(manifest);
    const hash = createHash(spkg);
    logger.info("download", { manifest, hash });

    // Csv root
    const folderGranular = options.folderGranular;
    const fileGranular = options.fileGranular;
    const csvRoot = getCsvRoot(options.csvRoot)
    const csvPath = `${csvRoot}/${hash}`;

    let lastPathRef: string = ""
    let lastFileRef: string = ""
    let fileRows: string[] = []

    // Run substreams
    const substreams = run(spkg, moduleName, options);
    handleManifest(substreams, manifest, hash);
    substreams.on("anyMessage", handleOperations);
    substreams.on("clock", clock => {
        handleClock(clock);
        handleExport(scrapeInterval, clock);
    });
    substreams.on("end", writeCsvRowsToFile);
    substreams.start(options.delayBeforeStart);
}

//////////////////////////////////////////////////////////
// importCSV

export async function actionImportCsv(options: ActionOptions) {
    async function processMetrics(filePath: string) {
        const lineSeparator = "\n";
        const csvSeparator = ","
        const formatSeparator = ","
        const csvData = fs.readFileSync(filePath, 'utf-8');
        const lines = csvData.trim().split(lineSeparator)

        // check if there is more than one line of data
        if (lines.length > 1) {
            const headers = lines[0].split(csvSeparator)
            logger.debug(`headers: ${headers}`)
            lines.shift()  // remove 1st line (headers)

            // create header mapping for metrics
            const mapping: string[] = []
            for (const header of headers) {
                const col = mapping.length + 1
                if (header == EPOCH_HEADER) {
                    mapping.push(`${col}:time:unix_ms`)
                } else {
                    mapping.push(`${col}:metric:${header}`)
                }
            }

            // inject labels
            const injectedLabelValues: string[] = [];
            for (const label in options.labels) {
                const col = mapping.length + 1
                mapping.push(`${col}:label:${label}`)
                injectedLabelValues.push(options.labels[label])
            }

            // create request body
            const injectedLabels = injectedLabelValues.join(csvSeparator)
            const body = lines.map(function (line, _index) {
                return injectedLabels.length !== 0 ? `${line}${csvSeparator}${injectedLabels}` : line
            }).join(lineSeparator)

            const { address, port } = options;
            const url = `http://${address}:${port}/api/v1/import/csv?format=` + mapping.join(formatSeparator)
            logger.debug(`URL: ${url}`)
            logger.debug(`BODY: ${body}`)
            await fetch(url, { method: 'POST', body }).catch((error) => {
                logger.error(error)
            });
        }
    }

    async function SearchSubFolders(root: string) {
        const fileList: string[] = []
        fs.readdirSync(root).forEach(object => {
            if (object != "." && object != "..") {
                const path = `${root}/${object}`
                if (fs.lstatSync(path).isDirectory()) {
                    SearchSubFolders(path)
                } else if (fs.lstatSync(path).isFile() && path.endsWith(".csv")) {
                    fileList.push(path)
                }
            }
        });
        for (const path of fileList) {
            await processMetrics(path)
        }
    }

    console.log(options)
    const csvRoot = getCsvRoot(options.csvRoot)
    await SearchSubFolders(csvRoot)
}