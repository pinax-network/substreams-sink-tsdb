import assert from 'node:assert';
import { describe, it } from 'node:test';
import { appendEpoch } from "../src/victoria_metrics";

const lines =`
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.392827

# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds.
# TYPE process_cpu_system_seconds_total counter
process_cpu_system_seconds_total{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.053007

# HELP process_cpu_seconds_total Total user and system CPU time spent in seconds.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.445834

# HELP process_start_time_seconds Start time of the process since unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1685049944

# HELP process_resident_memory_bytes Resident memory size in bytes.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 134623232

# HELP process_virtual_memory_bytes Virtual memory size in bytes.
# TYPE process_virtual_memory_bytes gauge
process_virtual_memory_bytes{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 34151223296

# HELP process_heap_bytes Process heap size in bytes.
# TYPE process_heap_bytes gauge
process_heap_bytes{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 204861440

# HELP process_open_fds Number of open file descriptors.
# TYPE process_open_fds gauge
process_open_fds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 36

# HELP process_max_fds Maximum number of open file descriptors.
# TYPE process_max_fds gauge
process_max_fds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 524288

# HELP nodejs_eventloop_lag_seconds Lag of event loop in seconds.
# TYPE nodejs_eventloop_lag_seconds gauge

# HELP nodejs_eventloop_lag_min_seconds The minimum recorded event loop delay.
# TYPE nodejs_eventloop_lag_min_seconds gauge
nodejs_eventloop_lag_min_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.009453568

# HELP nodejs_eventloop_lag_max_seconds The maximum recorded event loop delay.
# TYPE nodejs_eventloop_lag_max_seconds gauge
nodejs_eventloop_lag_max_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.079101951

# HELP nodejs_eventloop_lag_mean_seconds The mean of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_mean_seconds gauge
nodejs_eventloop_lag_mean_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.011403794070588235

# HELP nodejs_eventloop_lag_stddev_seconds The standard deviation of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_stddev_seconds gauge
nodejs_eventloop_lag_stddev_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.007685221554368312

# HELP nodejs_eventloop_lag_p50_seconds The 50th percentile of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_p50_seconds gauge
nodejs_eventloop_lag_p50_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.010092543

# HELP nodejs_eventloop_lag_p90_seconds The 90th percentile of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_p90_seconds gauge
nodejs_eventloop_lag_p90_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.011182079

# HELP nodejs_eventloop_lag_p99_seconds The 99th percentile of the recorded event loop delays.
# TYPE nodejs_eventloop_lag_p99_seconds gauge
nodejs_eventloop_lag_p99_seconds{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.024117247

# HELP nodejs_active_resources Number of active resources that are currently keeping the event loop alive, grouped by async resource type.
# TYPE nodejs_active_resources gauge
nodejs_active_resources{type="TTYWrap",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_active_resources{type="TCPSocketWrap",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1
nodejs_active_resources{type="Immediate",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1

# HELP nodejs_active_resources_total Total number of active resources.
# TYPE nodejs_active_resources_total gauge
nodejs_active_resources_total{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 4

# HELP nodejs_active_handles Number of active libuv handles grouped by handle type. Every handle type is C++ class name.
# TYPE nodejs_active_handles gauge
nodejs_active_handles{type="ReadStream",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1
nodejs_active_handles{type="WriteStream",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1
nodejs_active_handles{type="TLSSocket",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1

# HELP nodejs_active_handles_total Total number of active handles.
# TYPE nodejs_active_handles_total gauge
nodejs_active_handles_total{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 3

# HELP nodejs_active_requests Number of active libuv requests grouped by request type. Every request type is C++ class name.
# TYPE nodejs_active_requests gauge

# HELP nodejs_active_requests_total Total number of active requests.
# TYPE nodejs_active_requests_total gauge
nodejs_active_requests_total{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0

# HELP nodejs_heap_size_total_bytes Process heap size from Node.js in bytes.
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 61067264

# HELP nodejs_heap_size_used_bytes Process heap size used from Node.js in bytes.
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 33352024

# HELP nodejs_external_memory_bytes Node.js external memory size in bytes.
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 6326824

# HELP nodejs_heap_space_size_total_bytes Process heap space size total from Node.js in bytes.
# TYPE nodejs_heap_space_size_total_bytes gauge
nodejs_heap_space_size_total_bytes{space="read_only",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_total_bytes{space="old",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 24449024
nodejs_heap_space_size_total_bytes{space="code",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1785856
nodejs_heap_space_size_total_bytes{space="map",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_total_bytes{space="shared",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_total_bytes{space="new",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 33554432
nodejs_heap_space_size_total_bytes{space="large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1277952
nodejs_heap_space_size_total_bytes{space="code_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_total_bytes{space="new_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_total_bytes{space="shared_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0

# HELP nodejs_heap_space_size_used_bytes Process heap space size used from Node.js in bytes.
# TYPE nodejs_heap_space_size_used_bytes gauge
nodejs_heap_space_size_used_bytes{space="read_only",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_used_bytes{space="old",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 23721992
nodejs_heap_space_size_used_bytes{space="code",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1668864
nodejs_heap_space_size_used_bytes{space="map",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_used_bytes{space="shared",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_used_bytes{space="new",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 6736336
nodejs_heap_space_size_used_bytes{space="large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1236952
nodejs_heap_space_size_used_bytes{space="code_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_used_bytes{space="new_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_used_bytes{space="shared_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0

# HELP nodejs_heap_space_size_available_bytes Process heap space size available from Node.js in bytes.
# TYPE nodejs_heap_space_size_available_bytes gauge
nodejs_heap_space_size_available_bytes{space="read_only",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_available_bytes{space="old",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 298160
nodejs_heap_space_size_available_bytes{space="code",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2304
nodejs_heap_space_size_available_bytes{space="map",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_available_bytes{space="shared",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_available_bytes{space="new",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 9759792
nodejs_heap_space_size_available_bytes{space="large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_available_bytes{space="code_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_heap_space_size_available_bytes{space="new_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 16496128
nodejs_heap_space_size_available_bytes{space="shared_large_object",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0

# HELP nodejs_version_info Node.js version info.
# TYPE nodejs_version_info gauge
nodejs_version_info{version="v19.9.0",major="19",minor="9",patch="0",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1

# HELP nodejs_gc_duration_seconds Garbage collection duration by kind, one of major, minor, incremental or weakcb.
# TYPE nodejs_gc_duration_seconds histogram
nodejs_gc_duration_seconds_bucket{le="0.001",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0
nodejs_gc_duration_seconds_bucket{le="0.01",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_gc_duration_seconds_bucket{le="0.1",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_gc_duration_seconds_bucket{le="1",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_gc_duration_seconds_bucket{le="2",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_gc_duration_seconds_bucket{le="5",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_gc_duration_seconds_bucket{le="+Inf",kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2
nodejs_gc_duration_seconds_sum{kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 0.008018656000494957
nodejs_gc_duration_seconds_count{kind="minor",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 2

# HELP manifest Substreams manifest and sha256 hash of map module
# TYPE manifest gauge
manifest{hash="df0054125f1258d2d8f3b5815a8b5b335c9830c4ddbbb46dbef1d4eb6f94f835",manifest="https://github.com/pinax-network/subtivity-substreams/releases/download/v0.2.3/subtivity-antelope-v0.2.3.spkg",outputModule="prom_out",host="https://eos.firehose.eosnation.io:9001",auth="https://auth.streamingfast.io/v1/auth/issue",startBlockNum="200000000",productionMode="true",job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1

# HELP head_block_number Last block number processed by Substreams Sink
# TYPE head_block_number gauge
head_block_number{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 200000056

# HELP head_block_timestamp Last block timestamp (in seconds) processed by Substreams Sink
# TYPE head_block_timestamp gauge
head_block_timestamp{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1629160920

# HELP head_block_time_drift Head block drift (in seconds) by Substreams Sink
# TYPE head_block_time_drift gauge
head_block_time_drift{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 55889025

# HELP trace_calls custom help
# TYPE trace_calls counter
trace_calls{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 4284

# HELP transaction_traces custom help
# TYPE transaction_traces counter
transaction_traces{job="substivity",network="127.0.0.1",block_version="antelope",hostname="localhost",app="app1"} 1067
`

describe('appendEpoch', () => {
    it("test", () => {
      const epoch  = 1686315729000
      const results = appendEpoch(lines, epoch);
      const separator = "\n"
      const ending = ` ${epoch}`
      for (const line of results.trim().split(separator)) {
        assert.ok(!line.startsWith("#"))
        assert.ok(!(line.length==0))
        assert.ok(line.endsWith(ending))
        assert.ok(!line.startsWith(ending))
      }
    });
});