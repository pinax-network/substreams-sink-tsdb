#!/usr/bin/env node

import { cli } from "substreams-sink";
import { action, DEFAULT_ADDRESS, DEFAULT_PORT, DEFAULT_SCRAPE_INTERVAL } from "../index"
import pkg from "../package.json";
import { DEFAULT_COLLECT_DEFAULT_METRICS, handleLabels } from "substreams-sink-prometheus";

const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.option('-p --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
command.option('-a --address <string>', 'VictoriaMetrics address to connect.', DEFAULT_ADDRESS);
command.option('-i --scrape_interval <int>', 'Scrape Interval', String(DEFAULT_SCRAPE_INTERVAL));
command.option('-l --labels [...string]', "To apply generic labels to all default metrics (ex: --labels foo=bar)", handleLabels, {})
command.option('--collect-default-metrics <boolean>', "Collect default metrics", DEFAULT_COLLECT_DEFAULT_METRICS);
command.action(action);
program.parse();