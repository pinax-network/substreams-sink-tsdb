#!/usr/bin/env node
import { Command } from "commander"
import { cli } from "substreams-sink";
import { action, DEFAULT_ADDRESS, DEFAULT_PORT, DEFAULT_SCRAPE_INTERVAL, DEFAULT_CSV_ROOT, DEFAULT_BLOCK_GRANULAR } from "../index"
import { actionExportCsv, actionImportCsv } from "../src/csv"
import pkg from "../package.json";
import { DEFAULT_COLLECT_DEFAULT_METRICS, handleLabels } from "substreams-sink-prometheus";

const program = cli.program(pkg);
defaultOptions(cli.run(program, pkg)
    .option('-p --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
    .option('-a --address <string>', 'VictoriaMetrics address to connect.', DEFAULT_ADDRESS)
    .action(action))

const cmdCsv = program.command("csv")
// exportCSV
defaultOptions(cmdCsv.addCommand(cli.run(program, pkg).name("export")
    .description("Export CSV")
    .option('-i --scrape_interval <int>', 'Scrape Interval', String(DEFAULT_SCRAPE_INTERVAL))
    .option('--csv_root <string>', 'CSV root', String(DEFAULT_CSV_ROOT))
    .option('--block_granular <int>', 'CSV root', String(DEFAULT_BLOCK_GRANULAR))
    .action(actionExportCsv)))

// importCSV
cmdCsv.command("import")
    .description("Import csv")
    .option('-p --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
    .option('-a --address <string>', 'VictoriaMetrics address to connect.', DEFAULT_ADDRESS)
    .option('--csv_root <string>', 'CSV root', String(DEFAULT_CSV_ROOT))
    .option('-l --labels [...string]', "To apply generic labels to all default metrics (ex: --labels foo=bar)", handleLabels, {})
    .action(actionImportCsv)

program.showHelpAfterError();
program.parse();

function defaultOptions(command: Command) {
    return command
        .option('-i --scrape_interval <int>', 'Scrape Interval', String(DEFAULT_SCRAPE_INTERVAL))
        .option('-l --labels [...string]', "To apply generic labels to all default metrics (ex: --labels foo=bar)", handleLabels, {})
        .option('--collect-default-metrics <boolean>', "Collect default metrics", DEFAULT_COLLECT_DEFAULT_METRICS)
}