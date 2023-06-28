# [`Substreams`](https://substreams.streamingfast.io/) [`VictoriaMetrics`](https://victoriametrics.com/) CLI `Node.js`

[<img alt="github" src="" height="20">](https://github.com/pinax-network/substreams-sink-victoria-metrics)
[<img alt="npm" src="" height="20">](https://www.npmjs.com/package/substreams-sink-victoria-metrics)
[<img alt="GitHub Workflow Status" src="" height="20">](https://github.com/pinax-network/substreams-sink-victoria-metrics/actions?query=branch%3Amain)

> `substreams-sink-victoria-metrics` is a tool that allows developers to pipe data extracted from a blockchain to a VictoriaMetrics TSDB (Time Series Database).

## 📖 Documentation

### https://www.npmjs.com/package/substreams-sink-victoria-metrics

### Further resources

- [**Substreams** documentation](https://substreams.streamingfast.io)

### Protobuf

## CLI
[**Use pre-built binaries**](https://github.com/pinax-network/substreams-sink-victoria-metrics/releases)
- [x] MacOS
- [x] Linux
- [x] Windows

**Install** globally via npm
```
$ npm install -g substreams-sink-victoria-metrics
```

**Run**
```
$ substreams-sink-victoria-metrics run [options] <spkg>
```

**Export CSV**

see chart below

**Import CSV**

see chart below


## Features

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart
- [x] Export substreams results to csv files
- [x] Import from csv to Victoriametrics

## Command specific options


### csv export 

| options | use |
|----|---|
| scrape-interval | interval at which metrics are being collected
| csv-root| top folder where csv will be be created
| folder-granular| number of blocks per subfolder |
| file-granular| number of blocks per file|


Breakdown of the csv folder structure is as follow:

[csv-root]
..[hash]
....[folder]
.......[individual csv files]

**Example usage**

`./bin/cli.ts  csv export  https://github.com/pinax-network/subtivity-substreams/releases/download/v0.2.1/subtivity-antelope-v0.2.1.spkg  prom_out -e https://eos.firehose.eosnation.io:9001   --production-mode false    --cursor-file antelope1.lock -s 10000000 -t +1000000 --metrics-disabled  --csv-root=test_csv_big1 --folder-granular=50000 --file-granular=1000
`

### csv import

|options|use|
|----|----|
| csv-root| top folder from where the csv files will be read. 
|labels | url encoded list of labels to append |


**Example usage**

`tsx ./bin/cli.ts  csv import  https://github.com/pinax-network/subtivity-substreams/releases/download/v0.2.1/subtivity-antelope-v0.2.1.spkg  prom_out --labels 'job=substivity&network=127.0.0.1&block_version=antelope&hostname=localhost&app=app1' --csv-root=test_csv_big1`


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

