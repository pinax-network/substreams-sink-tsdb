import { logger } from "../index.js";
import { Counter, Gauge, Histogram, Summary } from "prom-client";
import { prometheus } from "substreams-sink"
// prom-client was getting confused because there was
// more than one registy
export const register = prometheus.registry

type CounterOp = {
    operation: string
    value: number
}

type GaugeOp = {
    operation: string
    value: number
}

interface PrometheusOperation {
    name: string
    labels?: Record<string, string>,
    counter?: CounterOp
    gauge?: GaugeOp
}

interface PrometheusOperations {
    operations: PrometheusOperation[];
}

export function handleLabels(value: string, previous: {}) {
    const params = new URLSearchParams(value);
    return { ...previous, ...Object.fromEntries(params) };
}

export function handleOperations(pp: any) {
    const promOps = pp as PrometheusOperations;
    for (const promOp of promOps.operations) {
        //console.log(promOp)
        if (promOp.hasOwnProperty('gauge')) {
            handleGauge(promOp);
        }

        if (promOp.hasOwnProperty('summary')) {
            //       handleSummary(promOp);
        }

        if (promOp.hasOwnProperty('counter')) {
            handleCounter(promOp);
        }

        if (promOp.hasOwnProperty('histogram')) {
            //     handleHistogram(promOp);
        }
    }
}

export function handleManifest(substreams: any, manifest: string, hash: string) {
    logger.info("manifest", { manifest, hash });
    const labelNames = ["hash", "manifest", "outputModule", "host", "auth", "startBlockNum", "productionMode"];
    registerGauge("manifest", "Substreams manifest and sha256 hash of map module", labelNames);
    const gauge = register.getSingleMetric("manifest") as Gauge;
    gauge.labels({
        hash,
        manifest,
        outputModule: substreams.outputModule,
        host: substreams.host,
        auth: substreams.auth,
        startBlockNum: substreams.startBlockNum,
        productionMode: String(substreams.productionMode)
    }).set(1)
}

export function handleClock(clock: any) {
    logger.info("clock", clock);
    const block_num = Number(clock.number);
    const seconds = Number(clock.timestamp?.seconds);
    const head_block_time_drift = Math.floor((new Date().valueOf() / 1000) - seconds);
    registerGauge("head_block_number", "Last block number processed by Substreams Sink");
    registerGauge("head_block_timestamp", "Last block timestamp (in seconds) processed by Substreams Sink");
    registerGauge("head_block_time_drift", "Head block drift (in seconds) by Substreams Sink");
    const gauge1 = register.getSingleMetric("head_block_number") as Gauge;
    const gauge2 = register.getSingleMetric("head_block_timestamp") as Gauge;
    const gauge3 = register.getSingleMetric("head_block_time_drift") as Gauge;
    if (gauge1) gauge1.set(block_num);
    if (gauge2) gauge2.set(seconds);
    if (gauge3) gauge3.set(head_block_time_drift);
}

export function handleCounter(promOp: PrometheusOperation) {
    const name = promOp.name
    const labels = promOp.labels || {};
    registerCounter(name, "custom help", Object.keys(labels)); // TO-DO!
    const operation = promOp.counter?.operation//  promOp.gauge?.operation
    const value = promOp.counter?.value//promOp.gauge?.value
    const counter = register.getSingleMetric(promOp.name) as Counter;
    if (labels) counter.labels(labels);
    switch (operation) {
        case "OPERATION_INC": counter.labels(labels).inc(); break; // INC
        case "OPERATION_ADD": counter.labels(labels).inc(value); break; // ADD
        case "OPERATION_REMOVE": counter.remove(labels); break; // REMOVE
        case "OPERATION_RESET": counter.reset(); break; // RESET        
        default: return; // SKIP
    }
    logger.info("counter", { name, labels, operation, value });
}

export function handleGauge(promOp: PrometheusOperation) {
    const name = promOp.name
    const labels = promOp.labels || {};
    registerGauge(name, "custom help", Object.keys(labels)); // TO-DO!
    const operation = promOp.gauge?.operation
    const value = promOp.gauge?.value
    let gauge = register.getSingleMetric(promOp.name) as Gauge;
    switch (operation) {
        case "OPERATION_INC": gauge.labels(labels).inc(); break; // INC
        case "OPERATION_ADD": gauge.labels(labels).inc(value); break; // ADD
        case "OPERATION_SET": gauge.labels(labels).set(value || 0); break; // SET
        case "OPERATION_DEC": gauge.labels(labels).dec(); break; // DEC
        case "OPERATION_SUB": gauge.labels(labels).dec(value); break; // SUB
        case "OPERATION_SET_TO_CURRENT_TIME": gauge.labels(labels).setToCurrentTime(); break; // SET_TO_CURRENT_TIME
        case "OPERATION_REMOVE": gauge.remove(labels); break; // REMOVE
        case "OPERATION_RESET": gauge.reset(); break; // RESET
        default: return; // SKIP
    }
    logger.info("gauge", { name, labels, operation, value });
}

/*
export function handleSummary(promOp: PrometheusOperation) {
    if (promOp.operation.case != "summary") return;
    const { name, labels } = promOp;
    registerSummary(name, "custom help", Object.keys(labels)); // TO-DO!
    const { operation, value } = promOp.operation.value;
    let summary = register.getSingleMetric(promOp.name) as Summary;
    switch (operation) {
        case 1: summary.labels(labels).observe(value); break; // OBSERVE
        case 2: summary.labels(labels).startTimer(); break; // START_TIMER
        case 7: summary.remove(labels); break; // REMOVE
        case 8: summary.reset(); break; // RESET
        default: return; // SKIP
    }
    logger.info("summary", { name, labels, operation, value });
}

export function handleHistogram(promOp: PrometheusOperation) {
    if (promOp.operation.case != "histogram") return;
    const { name, labels } = promOp;
    registerHistogram(name, "custom help", Object.keys(labels)); // TO-DO!
    const { operation, value } = promOp.operation.value;
    let histogram = register.getSingleMetric(promOp.name) as Histogram;
    switch (operation) {
        case 1: histogram.labels(labels).observe(value); break; // OBSERVE
        case 2: histogram.labels(labels).startTimer(); break; // START_TIMER
        case 3: histogram.zero(labels); break; // ZERO
        case 7: histogram.remove(labels); break; // REMOVE
        case 8: histogram.reset(); break; // RESET
        default: return; // SKIP
    }
    logger.info("histogram", { name, labels, operation, value });
}
*/

export function registerCounter(name: string, help = "help", labelNames: string[] = []) {
    try {
        register.registerMetric(new Counter({ name, help, labelNames }));
    } catch (e) {
        //
    }
}

export function registerGauge(name: string, help = "help", labelNames: string[] = []) {
    try {
        register.registerMetric(new Gauge({ name, help, labelNames }));
    } catch (e) {
        //
    }
}

export function registerHistogram(name: string, help = "help", labelNames: string[] = []) {
    // TO-DO extract from substreams.yaml as config
    const buckets = [0.001, 0.01, 0.1, 1, 2, 5];
    try {
        register.registerMetric(new Histogram({ name, help, labelNames }));
    } catch (e) {
        //
    }
}

export function registerSummary(name: string, help = "help", labelNames: string[] = []) {
    // TO-DO extract from substreams.yaml as config
    const percentiles = [0.01, 0.1, 0.9, 0.99];
    const maxAgeSeconds: number = 600;
    const ageBuckets: number = 5;
    const compressCount: number = 1;
    try {
        register.registerMetric(new Summary({ name, help, labelNames }));
    } catch (e) {
        //
    }
}