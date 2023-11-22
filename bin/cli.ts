#!/usr/bin/env node
import { commander } from "substreams-sink";
import { action, DEFAULT_VERBOSE, DEFAULT_HOST, DEFAULT_SCRAPE_INTERVAL, DEFAULT_CSV_ROOT, DEFAULT_FOLDER_GRANULAR, DEFAULT_FILE_GRANULAR } from "../index.js"
import { actionExportCsv, actionImportCsv } from "../src/csv.js"
import { handleLabels } from "../src/prom.js";

import pkg from "../package.json" assert { type: "json" };

const program = commander.program(pkg);
commander.run(program, pkg)
    .option('--host <string>', `VictoriaMetrics address to connect (e.g. ${DEFAULT_HOST}).`, DEFAULT_HOST)
    .option('-i --scrape-interval <int>', 'Scrape Interval', String(DEFAULT_SCRAPE_INTERVAL))
    .option('-l --labels [...string]', "To apply generic labels to all default metrics (ex: --labels foo=bar)", handleLabels, {})
    .action(action)

// csv command
const cmdCsv = program.command("csv").description("Additional csv options")
// csv export
commander.run(cmdCsv, pkg).name("export")
    .description("Export CSV files from Substreams")
    .option('-i --scrape-interval <int>', 'Scrape Interval (seconds)', String(DEFAULT_SCRAPE_INTERVAL))
    .option('--csv-root <string>', 'CSV root', String(DEFAULT_CSV_ROOT))
    .option('--folder-granular <int>', `folder granular (default: ${DEFAULT_FOLDER_GRANULAR})`, String(DEFAULT_FOLDER_GRANULAR))
    .option('--file-granular <int>', `file granular (default: ${DEFAULT_FILE_GRANULAR})`, String(DEFAULT_FILE_GRANULAR))
    .action(actionExportCsv)

// csv import
cmdCsv.command("import")
    .description("Import CSV files to VictoriaMetrics")
    .option('--host <string>', `VictoriaMetrics address to connect (e.g. ${DEFAULT_HOST}).`, DEFAULT_HOST)
    .option('--verbose', 'Enable verbose logging', DEFAULT_VERBOSE)
    .option('--csv-root <string>', 'CSV root', String(DEFAULT_CSV_ROOT))
    .option('-l --labels [...string]', "To apply generic labels to all default metrics (ex: --labels foo=bar)", handleLabels, {})
    .action(actionImportCsv)

program.showHelpAfterError();
program.parse();

