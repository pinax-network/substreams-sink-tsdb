import { logger } from "substreams-sink";
import pkg from "../package.json";
import { commander, setup } from "substreams-sink";
import { handleOperations, register } from "./prom";
import { createHash } from "substreams";
import { Clock } from "substreams";
import * as fs from 'fs';
import { fetchSubstream } from "@substreams/core";

const EPOCH_HEADER = "#epoch"
type Row = Map<string, string>

export interface ActionOptions extends commander.RunOptions {
    address: string;
    port: number;
    scrapeInterval: number;
    labels: Record<string, string>;
    collectDefaultMetrics: boolean;
    csvRoot: string;
    folderGranular: number;
    fileGranular: number;
    manifest: string
}

function getCsvRoot(rootValue: string) {
    if (rootValue.length === 0) {
        return "."
    }
    return rootValue.endsWith("/") ? rootValue.substring(0, rootValue.length - 1) : rootValue
}

//////////////////////////////////////////////////////////
// ExportCSV

export async function actionExportCsv(options: ActionOptions) {

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
    function extractMetrics(metrics: string, epoch: number): Row {
        const lineSeparator = "\n";
        const lines = metrics.trim().split(lineSeparator)
            .filter(line => line.length !== 0
                && !line.startsWith('#') && !line.startsWith("manifest")) // comment or empty line
        const rowData = new Map<string, string>();
        rowData.set(EPOCH_HEADER, epoch.toString())
        lines.map(function (val, _index) {
            const el = val.split(" ", 2)
            rowData.set(el[0], el[1])
        })
        return rowData
    }

    function writeCsvRowsToFile() {
        const colDelimiter = ","
        const rowDelimiter = "\n"
        if (lastFileRef.length !== 0) {
            const headerSet = new Set<string>()
            let refIndex = -1;
            const dataRows = allData.map(function (row, index) {
                if (row.size > headerSet.size) {
                    row.forEach((_val, key) => {
                        headerSet.add(key)
                    })
                    refIndex = index;
                }
                const orderedData = Array.from(headerSet).map(function (key, _index) {
                    return row.get(key)
                })
                return orderedData.join(colDelimiter)
            })
            const rows = [Array.from(headerSet).join(colDelimiter)]
            const body = () => {
                if (refIndex == 0) {
                    // returned unaltered rows
                    return rows.concat(dataRows).join(rowDelimiter)
                } else {
                    // pad rows with missing values
                    const dataRowsFixed = dataRows.map(function (row, index) {
                        if (index >= refIndex) {
                            return row
                        } else {
                            const p: string[] = row.split(colDelimiter)
                            while (p.length < headerSet.size) {
                                p.push("0")
                            }
                            return p.join(colDelimiter)
                        }
                    })
                    return rows.concat(dataRowsFixed).join(rowDelimiter)
                }
            }
            fs.writeFileSync(lastFileRef, body());
        }
    }

    async function handleExport(scrapeInterval: number, clock: Clock) {
        logger.info(`*** handleExport ${scrapeInterval}`)
        const block_num = Number(clock.number);

        if (!clock.timestamp) return; // no timestamp yet
        const epoch = clock.timestamp.toDate().valueOf();
        if (epoch / 1000 % scrapeInterval != 0) return; // only handle epoch intervals
        const metrics = await register.metrics();
        const csvRow = extractMetrics(metrics, epoch)

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
                allData = []
            }
            allData.push(csvRow) // csv data
        } catch (err) {
            logger.error(err);
        }
    }

    // Get command options
    const { address, port, scrapeInterval } = options;

    //logger.info(`manifest: ${manifest} moduleName: ${moduleName}`)
    logger.info("options:", options)
    console.log(options)

    logger.info(`vitals: ${address} ${port} ${scrapeInterval}`)

    // Download substreams
    const spkg = await fetchSubstream(options.manifest);
    const hash = createHash(spkg.toBinary());
    logger.info("download", options.manifest, hash);

    // Csv root
    const folderGranular = options.folderGranular;
    const fileGranular = options.fileGranular;
    const csvRoot = getCsvRoot(options.csvRoot)
    const csvPath = `${csvRoot}/${hash}`;

    let lastPathRef: string = ""
    let lastFileRef: string = ""
    let allData: Row[];

    // Run substreams
    const emitter = await setup(options, pkg);
    emitter.on("anyMessage", (messages, cursor, clock) => {
        handleOperations(messages);
        handleExport(scrapeInterval, clock);
    });

    // Start streaming
    await emitter.start(options.delayBeforeStart);
    // write last batch
    writeCsvRowsToFile();
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