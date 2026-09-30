/**
 * Database Indexing & Query Optimization Types (FINAL_002)
 * High-performance index definitions, table sizing, query benchmarks, and maintenance logs.
 */

export type IndexType = "UNIQUE" | "Regular" | "Composite" | "Spatial";
export type IndexPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type IndexStatus = "BUILT" | "ACTIVE" | "REBUILDING";

export type OptimizedTableName =
  | "INDIA_PINCODES"
  | "FARMER_FEEDBACK"
  | "SMS_REGISTERED_FARMERS"
  | "WEATHER_CACHE"
  | "PEST_DISEASE_TRIGGERS";

export interface IndexDefinition {
  index_id: string;
  index_name: string;
  table_name: OptimizedTableName;
  columns: string[];
  type: IndexType;
  priority: IndexPriority;
  status: IndexStatus;
  total_entries: number;
  seek_count: number;
  scan_prevented_count: number;
  fragmentation_pct: number;
  size_kb: number;
  performance_gain: string;
  use_case: string;
  query_example: string;
  last_rebuilt: string;
}

export interface TableSizeSummary {
  table_name: OptimizedTableName;
  row_count: number;
  estimated_size_bytes: number;
  size_formatted: string;
  indexes_count: number;
  status: "OPTIMIZED" | "PENDING_INDEX" | "NORMAL";
  description: string;
  primary_key: string;
}

export interface QueryBenchmarkResult {
  benchmark_id: string;
  table: OptimizedTableName;
  query_name: string;
  query_description: string;
  sql_equivalent: string;
  time_before_index_ms: number; // Simulated full table scan
  time_after_index_ms: number; // Actual index seek
  speedup_factor: number; // e.g. 100x
  rows_scanned_before: number;
  rows_scanned_after: number;
  index_used: string;
  status: "PASSED" | "SUB_OPTIMAL";
}

export interface IndexMaintenanceLog {
  log_id: number;
  timestamp: string;
  action: "REBUILD_ALL" | "ANALYZE_USAGE" | "DEFRAGMENT" | "SCHEDULED_SUNDAY";
  tables_optimized: OptimizedTableName[];
  indexes_rebuilt: number;
  duration_ms: number;
  status: "SUCCESS" | "FAILED";
  details: string;
}

export interface DatabaseOptimizationSummary {
  total_tables: number;
  total_indexes: number;
  total_indexed_records: number;
  avg_speedup_factor: number;
  estimated_index_storage_kb: number;
  index_health_percentage: number;
  tables_summary: TableSizeSummary[];
  indexes_registry: IndexDefinition[];
  benchmarks: QueryBenchmarkResult[];
  maintenance_logs: IndexMaintenanceLog[];
}
