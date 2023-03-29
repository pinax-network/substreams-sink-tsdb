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