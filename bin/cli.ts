#!/usr/bin/env node

import { cli } from "substreams-sink";
import { action, DEFAULT_ADDRESS, DEFAULT_PORT, DEFAULT_SCRAPE_INTERVAL } from "../index"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.option('-i --scrape_interval <int>', 'Scrape Interval', String(DEFAULT_SCRAPE_INTERVAL));
command.option('-p --port <int>', 'Listens on port number.', String(DEFAULT_PORT))
command.option('-a --address <string>', 'Address to use', DEFAULT_ADDRESS)
command.action(action);
program.parse();