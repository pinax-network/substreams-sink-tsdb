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

## Features

- Consume `*.spkg` from:
  - [x] Load URL or IPFS
  - [ ] Read from `*.spkg` local filesystem
  - [ ] Read from `substreams.yaml` local filesystem
- [x] Handle `cursor` restart

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

