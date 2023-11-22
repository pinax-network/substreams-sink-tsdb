# [`Substreams`](https://substreams.streamingfast.io/) [`VictoriaMetrics`](https://victoriametrics.com/) CLI `Node.js`

> `substreams-sink-victoria-metrics` is a tool that allows developers to pipe data extracted from a blockchain to a VictoriaMetrics TSDB (Time Series Database).

## 📖 Documentation

### https://www.npmjs.com/package/substreams-sink-victoria-metrics

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)
- [**`Victoria Metrics`**](https://victoriametrics.com/)

### Protobuf

## CLI
[**Use pre-built binaries**](https://github.com/pinax-network/substreams-sink-victoria-metrics/releases)
- [ ] MacOS
- [x] Linux
- [ ] Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-victoria-metrics
```

**Run**
```
$ substreams-sink-victoria-metrics run [options] <spkg>
```

## Features

- [x] Export substreams results to csv files
- [x] Import from csv to Victoriametrics

## Command specific options

### Run

```bash
Usage: substreams-sink-victoria-metrics run [options]

Substreams VictoriaMetrics sink module

Options:
  -e --substreams-endpoint <string>    Substreams gRPC endpoint to stream data from (env: SUBSTREAMS_ENDPOINT)
  --manifest <string>                  URL of Substreams package (env: MANIFEST)
  --module-name <string>               Name of the output module (declared in the manifest) (env: MODULE_NAME)
  -s --start-block <int>               Start block to stream from (defaults to -1, which means the initialBlock of the first module you are streaming) (default: "-1", env: START_BLOCK)
  -t --stop-block <int>                Stop block to end stream at, inclusively (env: STOP_BLOCK)
  -p, --params <string...>             Set a params for parameterizable modules. Can be specified multiple times. (ex: -p module1=valA -p module2=valX&valY) (default: [], env: PARAMS)
  --substreams-api-token <string>      API token for the substream endpoint or API key if '--auth-issue-url' is specified (default: "", env: SUBSTREAMS_API_TOKEN)
  --auth-issue-url <string>            URL used to issue a token (default: "https://auth.pinax.network/v1/auth/issue", env: AUTH_ISSUE_URL)
  --delay-before-start <int>           Delay (ms) before starting Substreams (default: 0, env: DELAY_BEFORE_START)
  --cursor-path <string>               File path or URL to cursor lock file (default: "cursor.lock", env: CURSOR_PATH)
  --http-cursor-auth <string>          Basic auth credentials for http cursor (ex: username:password) (env: HTTP_CURSOR_AUTH)
  --production-mode <boolean>          Enable production mode, allows cached substreams data if available (default: "false", env: PRODUCTION_MODE)
  --inactivity-seconds <int>           If set, the sink will stop when inactive for over a certain amount of seconds (default: 300, env: INACTIVITY_SECONDS)
  --hostname <string>                  The process will listen on this hostname for any HTTP and Prometheus metrics requests (default: "localhost", env: HOSTNAME)
  --port <int>                         The process will listen on this port for any HTTP and Prometheus metrics requests (default: 9102, env: PORT)
  --metrics-labels [string...]         To apply generic labels to all default metrics (ex: --labels foo=bar) (default: {}, env: METRICS_LABELS)
  --collect-default-metrics <boolean>  Collect default metrics (default: "false", env: COLLECT_DEFAULT_METRICS)
  --headers [string...]                Set headers that will be sent on every requests (ex: --headers X-HEADER=headerA) (default: {}, env: HEADERS)
  --final-blocks-only <boolean>        Only process blocks that have pass finality, to prevent any reorg and undo signal by staying further away from the chain HEAD (default: "false", env: FINAL_BLOCKS_ONLY)
  --verbose <boolean>                  Enable verbose logging (default: "false", env: VERBOSE)
  --host <string>                      VictoriaMetrics address to connect. (default: "http://0.0.0.0:8428")
  -i --scrape-interval <int>           Scrape Interval (default: "30")
  -l --labels [...string]              To apply generic labels to all default metrics (ex: --labels foo=bar) (default: {})
  -h, --help                           display help for command
```

### CSV export

```bash
Usage: substreams-sink-victoria-metrics csv export [options]

Export CSV files from Substreams

Options:
  <...>
  -i --scrape-interval <int>           Scrape Interval (seconds) (default: "30")
  --csv-root <string>                  CSV root (default: "./csv")
  --folder-granular <int>              folder granular (default: 1000) (default: "1000")
  --file-granular <int>                file granular (default: 100) (default: "100")
  -h, --help                           display help for command
  ```

## Folder structure

Breakdown of the csv folder structure is as follow:

- [csv-root]
  - [module hash]
    - [block folder]
      - [files]*.csv

**Example usage**

```bash
substreams-sink-victoria-metrics csv export --manifest https://github.com/pinax-network/subtivity-substreams/releases/download/v0.2.1/subtivity-antelope-v0.2.1.spkg --module-name prom_out -e https://eos.firehose.eosnation.io:9001 --cursor-file antelope1.lock -s 10000000 -t +1000000 --csv-root=./export_root_folder --folder-granular=50000 --file-granular=1000
```

### Import CSV

```bash
Usage: substreams-sink-victoria-metrics csv import [options]

Import CSV files to VictoriaMetrics

Options:
  --verbose                Enable verbose logging (default: false)
  --host <string>          VictoriaMetrics address to connect. (default: "http://0.0.0.0:8428")
  --csv-root <string>      CSV root (default: "./csv")
  -l --labels [...string]  To apply generic labels to all default metrics (ex: --labels foo=bar) (default: {})
  -h, --help               display help for command
```

**Example usage**

```bash
substreams-sink-victoria-metrics csv import --labels 'job=substivity&network=127.0.0.1&block_version=antelope&hostname=localhost&app=app1' --csv-root=import_csv_folder
```

## Performance measured

This is a comparison of relative speed between v1, v2 and the cache given a scrape interval of 30s.


| Range     | Time   | blk/ s| ver|
|-----------|--------|-------|----|
| 190M-195M | 38m37s | 2157  | v2
| 200M-205M | 52m48s | 1578  | v1
| 200M-205M | 39m10s | 2127  | cached
| 200M-205M | 40m32s | 2055  | cached
| 200M-205M | 33m    | 2525  | cached
| 205M-210M | 42m17s | 1970  | v1
| 210M-215M | 44m38s | 1867  | v1
| 215M-220M | 45m51s | 1817  | v1
| 215M-220M | 38m9s  | 2184  | cached
| 215M-220M | 38m24s | 2170  | cached
| 220M-225M | 54m21s | 1533  | v1
| 230M-235M | 37m53s | 2199  | v2
| 240M-245M | 38m29s | 2165  | v2
| 300M-305M | 43m14s | 1927  | v1
| 300M-305M | 35m23s | 2355  | cached

