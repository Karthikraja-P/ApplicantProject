const { useState, useEffect, useRef } = React;

const QUESTIONS = [
  { id:1,  cat:"Database Design",
    q:"A trading system stores option premium prices that must never have floating-point rounding errors. Which data type is correct?",
    opts:["FLOAT","DOUBLE","DECIMAL / NUMERIC","BIGINT"], ans:2 },
  { id:2,  cat:"Creative DB Design",
    q:"An ML pipeline adds a new feature column to the trades table every sprint. After 18 months there are 130+ columns. What is the core structural problem?",
    opts:["Schema becomes brittle — features should move to a separate feature-store table","Indexes stop working beyond 100 columns","The primary key will overflow","VARCHAR columns auto-truncate at 100 entries"], ans:0 },
  { id:3,  cat:"Database Design",
    q:"A 400M-row order-book table is queried with WHERE timestamp BETWEEN t1 AND t2. Which index type is best suited for range scans?",
    opts:["Hash index","Full-text index","B-Tree index","Bitmap index"], ans:2 },
  { id:4,  cat:"Creative DB Design",
    q:"Compliance requires that every price update in the system be reconstructable to any past point in time. What schema pattern fulfils this?",
    opts:["Update the row in-place and store only the latest value","Use a nightly backup script","Store a snapshot in a separate archive table weekly","Append-only inserts with a recorded_at timestamp — never UPDATE or DELETE"], ans:3 },
  { id:5,  cat:"Database Design",
    q:"Both PRIMARY KEY and UNIQUE enforce no-duplicate values. What does PRIMARY KEY additionally guarantee that UNIQUE alone does not?",
    opts:["It can reference foreign keys in other tables","It can span multiple columns","The column cannot contain NULL","It always creates a clustered index in every database"], ans:2 },
  { id:6,  cat:"Creative DB Design",
    q:"15 analytics workers query the same positions table simultaneously during market hours, causing lock contention on the primary DB. What is the most scalable fix?",
    opts:["Add read replicas or a caching layer so read traffic bypasses the primary","Increase the size of the primary key to 64-bit","Remove all indexes to reduce lock surface area","Switch all column types from INT to VARCHAR"], ans:0 },
  { id:7,  cat:"Database Design",
    q:"A table has composite PK (order_id, product_id). Column supplier_name depends only on product_id, not the full composite key. Which normal form is violated?",
    opts:["1NF","2NF","3NF","BCNF"], ans:1 },
  { id:8,  cat:"Creative DB Design",
    q:"Two order-execution services simultaneously pick jobs from the same pending_orders table. What SQL mechanism prevents both from claiming the same row?",
    opts:["A composite index on order_id and created_at","A UNIQUE constraint on the status column","SELECT … FOR UPDATE (pessimistic row-level lock)","Increasing the auto-increment step to avoid collisions"], ans:2 },
  { id:9,  cat:"Database Design",
    q:"A fund transfer debits Account A and credits Account B. A crash occurs after the debit but before the credit. Which ACID property ensures both operations roll back together?",
    opts:["Consistency","Isolation","Durability","Atomicity"], ans:3 },
  { id:10, cat:"Creative DB Design",
    q:"You store 1-minute OHLCV bars for 500 instruments. Queries are almost always for a single instrument over a date range. What is the most query-efficient schema design?",
    opts:["One table per instrument (500 tables total)","A single bars table with (instrument_id, timestamp) composite key, range-partitioned by date","A JSON array column storing one day's bars per row","A separate database per instrument"], ans:1 },
  { id:11, cat:"Database Design",
    q:"A live order-entry system and an end-of-day P&L report generator — which workload types are these respectively?",
    opts:["OLAP, OLTP","OLAP, OLAP","OLTP, OLAP","OLTP, OLTP"], ans:2 },
  { id:12, cat:"Creative DB Design",
    q:"Order history older than 6 months is queried rarely but must be retained for 7 years. Real-time queries need sub-5ms. How do you architect storage?",
    opts:["Keep all rows in one table and keep adding RAM","Replicate the full table to a second server every 6 months","Index every column to make cold reads fast","Archive old rows to cheaper cold storage; keep recent rows in the hot DB with date-based partitioning"], ans:3 },
  { id:13, cat:"Database Design",
    q:"SELECT user_id, total FROM orders WHERE status = 'open'. An index on (status, user_id, total) exists. What is the specific performance gain?",
    opts:["The table is auto-partitioned on first query","The query is served entirely from the index — no table heap access needed","Deadlocks on the table are prevented","The query planner rewrites the SQL automatically"], ans:1 },
  { id:14, cat:"Creative DB Design",
    q:"A junior engineer enforces 'every trade must belong to a valid portfolio' with a Python if-check. What is the architectural flaw?",
    opts:["Direct DB writes, migrations, or other services bypass the app layer entirely — enforce with a FOREIGN KEY at DB level","Python if-checks introduce too much latency in a trading system","Foreign keys only work within the same microservice boundary","Application layer is always the correct place for business rules"], ans:0 },
  { id:15, cat:"Database Design",
    q:"You suspect a slow query is doing a sequential scan instead of using an index. In PostgreSQL, which command reveals actual execution time and real row counts?",
    opts:["DESCRIBE query","SHOW PLAN FOR query","PROFILE query","EXPLAIN ANALYZE query"], ans:3 },
  { id:16, cat:"Creative DB Design",
    q:"A system ingests 80,000 market tick events per second. Rows are never updated or deleted. What schema principle matters most?",
    opts:["Minimise index count to reduce write overhead — design for append-only inserts with time-based partitioning","Add a UNIQUE constraint on every event column to prevent duplicates","Use a single summary row and UPDATE it on each event","Normalise to 4NF to minimise storage overhead"], ans:0 },
  { id:17, cat:"Database Design",
    q:"Dropping a parent table that has child rows referencing it via FOREIGN KEY raises an error. What does this tell you?",
    opts:["Foreign keys only enforce constraints on VARCHAR columns","Foreign keys are checked only during SELECT queries","Foreign keys protect referential integrity by blocking deletion of referenced parent rows","Foreign keys block all INSERT operations on the child table"], ans:2 },
  { id:18, cat:"Creative DB Design",
    q:"A portfolio summary query ran in 1s on 500K rows. After 18 months it takes 4 minutes on 90M rows. No code changed. Most likely cause?",
    opts:["The database connection pool is exhausted","The server timezone was updated during a maintenance window","A VARCHAR column silently converted to TEXT","The query now triggers a full table scan — the index is not selective enough at this data volume"], ans:3 },
  { id:19, cat:"Database Design",
    q:"Transaction A reads a balance. Transaction B updates and commits it. Transaction A reads again in the same transaction and gets a different value. What is this anomaly called?",
    opts:["Dirty read","Non-repeatable read","Phantom read","Lost update"], ans:1 },
  { id:20, cat:"Database Design",
    q:"A users table has 60 columns. profile_bio and avatar_url are large BLOBs rarely accessed — most queries only need id, name, email. What design improves performance?",
    opts:["Add a hash index on profile_bio","Increase the VARCHAR limit so large columns don't overflow","Merge all rarely-used columns into one JSON blob column","Move infrequently accessed large columns to a separate table (vertical partitioning)"], ans:3 },
  { id:21, cat:"Database Design",
    q:"MySQL InnoDB uses a clustered index so rows are physically ordered by primary key. What is the key implication of using a random UUID as the primary key?",
    opts:["Random UUIDs cause page fragmentation and slow inserts — rows cannot be appended sequentially to the leaf pages","UUIDs are too short to serve as primary keys","Clustered indexes only work with integer keys","Non-clustered indexes stop functioning when UUIDs are used"], ans:0 },
  { id:22, cat:"Creative DB Design",
    q:"You need to add a NOT NULL column to a 300M-row production table with zero downtime. What is the safest migration approach?",
    opts:["ALTER TABLE ADD COLUMN NOT NULL — it's instant in all modern databases","Drop and recreate the table with the new schema","Add the column as nullable first, backfill data in batches, then add the NOT NULL constraint separately","Pause all application writes, run migration, then resume"], ans:2 },
  { id:23, cat:"Database Design",
    q:"Under the CAP theorem, during a network partition a distributed system must sacrifice one of two properties. Which two does it choose between?",
    opts:["Atomicity and Durability","Consistency and Availability","Consistency and Partition Tolerance","Availability and Atomicity"], ans:1 },
  { id:24, cat:"Creative DB Design",
    q:"An order submission service retries on network failure and may send the same order twice. What DB-level pattern prevents duplicate orders?",
    opts:["A unique idempotency key on the orders table so duplicate inserts are rejected or ignored silently","Storing orders as VARCHAR so the app layer can detect duplicates","Using a FLOAT primary key to absorb collisions","Increasing the connection pool size to reduce retry probability"], ans:0 },
  { id:25, cat:"Database Design",
    q:"Process A holds a lock on Row 1 and waits for Row 2. Process B holds Row 2 and waits for Row 1. What is this condition and how do databases typically resolve it?",
    opts:["Race condition — resolved by increasing the query timeout","Stale read — resolved by MVCC","Dirty read — resolved by READ COMMITTED isolation","Deadlock — the DB detects the cycle and rolls back one of the transactions"], ans:3 },
  { id:26, cat:"Creative DB Design",
    q:"You log raw JSON payloads from a third-party data feed — the schema changes often and queries are simple lookups by event_id. Which database type fits best?",
    opts:["Relational DB with strict schema and foreign keys","Graph database optimised for relationship traversal","Document store or key-value store — schema-flexible and suited to high-write, simple-lookup workloads","Columnar warehouse optimised for aggregation queries"], ans:2 },
  { id:27, cat:"Database Design",
    q:"Which transaction isolation level completely eliminates dirty reads, non-repeatable reads, and phantom reads — at the cost of maximum lock contention?",
    opts:["READ UNCOMMITTED","READ COMMITTED","REPEATABLE READ","SERIALIZABLE"], ans:3 },
  { id:28, cat:"Creative DB Design",
    q:"Opening a fresh DB connection per API request adds 80ms overhead. The service handles 2,000 requests/second. What is the standard solution?",
    opts:["Use a connection pool — reuse a fixed set of persistent connections across requests","Increase database server RAM to absorb connection overhead","Switch from TCP to UDP for lower handshake latency","Add an index on the connections metadata table"], ans:0 },
  { id:29, cat:"Database Design",
    q:"A column called is_active holds only TRUE or FALSE across 50M rows. You add a B-Tree index on it. Why will the query planner likely ignore it?",
    opts:["B-Tree indexes cannot store boolean values","The index file will exceed the table size on disk","Boolean columns are auto-indexed by the database engine","Low cardinality means the index offers almost no selectivity — a full scan is often cheaper"], ans:3 },
  { id:30, cat:"Creative DB Design",
    q:"A fully normalised schema with 10 joined tables runs a dashboard query in 9 seconds. A pre-computed summary table reduces it to 60ms. What principle does this illustrate?",
    opts:["Normalisation is always wrong in production systems","Summary/materialised views violate ACID and should be avoided","Denormalisation trades write complexity and storage for read performance — a valid pattern for read-heavy analytics","Joins should be replaced with application-side merges"], ans:2 },

  // ─── depth questions ────────────────────────────────────────────────────
  { id:31, cat:"Database Design",
    q:"An index exists on (status, created_at). A query runs WHERE created_at > '2024-01-01' without filtering on status at all. Will this index be used efficiently?",
    opts:["Yes — PostgreSQL's index-skip scan lets the planner use any column in a composite index regardless of order","No — the leading column is status; queries not filtering on it cannot use this index efficiently","Yes — the query planner rewrites predicates to match the index column order automatically","No — composite indexes only work when all indexed columns appear in the WHERE clause"], ans:1 },

  { id:32, cat:"Database Design",
    q:"PostgreSQL uses MVCC (Multi-Version Concurrency Control). What is the primary operational benefit for a system with heavy concurrent reads and writes?",
    opts:["It allows the DB to bypass the WAL during reads, reducing I/O under heavy concurrency","It enables automatic read-replica promotion when the primary is under load","Readers never block writers and writers never block readers — each transaction sees a consistent point-in-time snapshot","It prevents deadlocks by serialising conflicting transactions through a central lock manager"], ans:2 },

  { id:33, cat:"Database Design",
    q:"A trades table has 50M rows. 99% have status = 'closed', only 1% have status = 'open'. Queries almost exclusively filter for open trades. What is the most efficient index strategy?",
    opts:["A full B-Tree index on status — the planner will skip closed rows automatically","A hash index on status for O(1) equality lookups on open trades","A composite index on (status, trade_id) so the planner can use an index-only scan","A partial index WHERE status = 'open' — indexes only the 1% of rows that queries actually touch"], ans:3 },

  { id:34, cat:"Database Design",
    q:"In PostgreSQL, UPDATE and DELETE leave dead tuples behind rather than reclaiming space immediately. What mechanism removes them?",
    opts:["VACUUM — removes dead tuples, updates visibility maps, and reclaims space for reuse","AUTOVACUUM runs ANALYZE on the table, which identifies and removes dead tuples as a side effect","REINDEX — rebuilds index pages and purges dead tuple references embedded in them","ANALYZE — collects table statistics and frees dead tuple space as part of the scan"], ans:0 },

  { id:35, cat:"Database Design",
    q:"A nightly P&L aggregation joins 8 tables and takes 2 minutes. It powers a dashboard refreshed every 10 minutes. What is the right database-level solution?",
    opts:["Run the 2-minute query live on every dashboard load and cache results in the application layer","A regular VIEW — the database re-evaluates it on each access but caches the query plan","A materialized view — pre-compute and persist the result, refreshed on a defined schedule","Add covering indexes on all 8 tables — join performance will improve proportionally to the index count"], ans:2 },

  { id:36, cat:"Database Design",
    q:"PostgreSQL's Write-Ahead Log (WAL) primarily guarantees crash recovery. What is its key secondary role in a production trading system?",
    opts:["It serialises all concurrent writes through a single queue, preventing write-write conflicts between sessions","It maintains a read buffer of recently committed rows so replicas can serve reads without contacting the primary","It is streamed to standby servers, enabling hot-standby replication and point-in-time recovery","It checkpoints dirty pages to disk on a schedule, reducing the I/O cost of fsync on commit"], ans:2 },

  { id:37, cat:"Database Design",
    q:"EXPLAIN ANALYZE shows 'Bitmap Index Scan → Bitmap Heap Scan' on a query. What does this execution pattern indicate?",
    opts:["The planner fell back to a sequential scan after the index scan returned too many rows","The index is being rebuilt in the background while the query runs using a shadow copy","The planner combined multiple index ranges into an in-memory bitmap before fetching heap pages — efficient for moderate result set sizes","Two separate indexes are being merged via a hash join before the table is accessed"], ans:2 },

  { id:38, cat:"Database Design",
    q:"A trades table uses trade_ref (business-assigned alphanumeric) as the primary key. What is the principal risk?",
    opts:["String primary keys always produce a non-clustered heap layout, adding an extra lookup per query in InnoDB","Sequential integer keys are more cache-friendly, making string PKs significantly slower for range scans","Alphanumeric keys create page fragmentation at the same rate as random UUIDs, regardless of the assignment pattern","Business keys can change or be reassigned — updates cascade through all foreign key references, causing fragility and inconsistency"], ans:3 },

  { id:39, cat:"Creative DB Design",
    q:"You must retrieve all ticks for a single instrument between 9:15 and 9:30 AM from a 2-billion-row tick table in under 20ms. What combination makes this feasible?",
    opts:["A hash index on instrument_id for O(1) instrument lookup, combined with a sequential scan of the resulting rows for the time range","Range partitioning by date alone, with a B-Tree index on instrument_id within each partition","A covering index on (event_time, instrument_id) — covering indexes eliminate all heap access, making any query instant","Composite index on (instrument_id, event_time) with date-range partitioning so the scan touches only one partition"], ans:3 },

  { id:40, cat:"Creative DB Design",
    q:"Your backtesting engine must reconstruct the exact market state at any arbitrary historical timestamp. Which design approach makes this possible without data loss?",
    opts:["Store daily OHLCV snapshots — replay accuracy degrades gracefully within each day's window","Overwrite order book state in-place and maintain a change-log table populated by DB triggers","Use an event-sourced append-only log of every market event — replay from any point T to reconstruct exact state","Take minute-level snapshots and use linear interpolation for sub-minute precision"], ans:2 },

  { id:41, cat:"Creative DB Design",
    q:"You need to trace any filled trade back through the full chain — signal triggered it, strategy generated the signal, model produced the feature. What schema design enables this audit trail?",
    opts:["Store all fields (model_id, strategy_id, signal_id, trade_id) as denormalised columns in one trades row","A normalised chain of linked tables: models → strategies → signals → orders → trades, joined by foreign key at each step","Store lineage as a JSONB column on the trades table — flexible and queryable without schema changes","Use a graph database for lineage — relational DBs cannot efficiently traverse directed chains of this depth"], ans:1 },

  { id:42, cat:"Creative DB Design",
    q:"You store the full NIFTY50 options chain — multiple expiries, strikes, CE and PE. Queries filter by expiry and strike. What is the cleanest schema?",
    opts:["One table per expiry date — keeps each expiry's data isolated and avoids cross-expiry scans","A single options_chain table with (underlying, expiry_date, strike, option_type) as composite key, indexed on (underlying, expiry_date, strike)","Partition the options_chain table by option_type (CE/PE) — puts and calls have different Greeks and should be physically separated","Normalise into three tables (underlyings, expiries, strikes) joined at query time to avoid data duplication"], ans:1 },

  { id:43, cat:"Creative DB Design",
    q:"Market data from a slow feed arrives 30 seconds late and must be stored with the original event timestamp, not the wall-clock write time. What schema correctly handles this?",
    opts:["Two timestamps per row: event_time (when the event occurred) and ingested_at (when written to DB) — always query and sort on event_time","Store only ingested_at and subtract the known feed latency at query time to recover approximate event timing","Reject late-arriving rows — insert them instead into a reconciliation table and merge nightly via a scheduled job","Stage late-arriving rows in a buffer table and merge them into the main time-series table sorted by event_time during off-peak hours"], ans:0 },

  { id:44, cat:"Creative DB Design",
    q:"Daily P&L can always be derived as (exit_price − entry_price) × quantity. When is it justified to store this as a persisted column?",
    opts:["Never — any derived value that can drift from its inputs will cause reconciliation failures over time","When the field is frequently queried, used in filters or ORDER BY, or expensive to recompute across tens of millions of rows","Only when the inputs (prices, quantities) are immutable after settlement — mutable inputs make stored derivations unsafe","Store it only if DECIMAL precision is required — integer arithmetic can always be derived safely at query time"], ans:1 },

  { id:45, cat:"Creative DB Design",
    q:"A tick database is growing past 5TB. What is the key tradeoff between sharding by instrument_id versus sharding by date range?",
    opts:["Instrument sharding co-locates each instrument's history (fast per-instrument queries) but risks write hotspots if a few instruments dominate volume; date sharding distributes writes evenly but forces cross-shard fan-out for single-instrument history","Instrument sharding should always be chosen — financial queries are almost always scoped to a single instrument, making cross-shard fan-out irrelevant","Date sharding should always be chosen — even distribution guarantees lower tail latency under any query pattern","A composite shard key of (instrument_id % N, date % M) eliminates hotspots in both dimensions simultaneously"], ans:0 },

  { id:46, cat:"Creative DB Design",
    q:"An order moves through states: submitted → acknowledged → partially_filled → filled. Should you UPDATE a single orders row, or use an append-only state event log?",
    opts:["UPDATE the single row — simpler schema, and a DB trigger can snapshot changes to an audit table if history is ever needed","Append-only event log — full history preserved, replay possible, and concurrent updates cannot silently overwrite each other","Snapshot the mutable orders row to an orders_history table on each state change using a DB trigger","Keep the mutable row but emit state transitions to a message queue; consume them downstream for audit if required"], ans:1 },

  { id:47, cat:"Creative DB Design",
    q:"Your platform has 20 microservices, each with a connection pool of 50. PostgreSQL max_connections = 200. What is the risk at peak load?",
    opts:["No risk — each pool is capped at 50, so the total active connections stays within bounds at any given moment","Connections beyond the limit queue invisibly inside the OS TCP stack until a slot opens","At peak, 20 × 50 = 1,000 simultaneous connection attempts against a 200-connection limit causes connection refusals and cascading failures","The application-level pool negotiates with pg_bouncer internally to stay under the server limit"], ans:2 },

  { id:48, cat:"Database Design",
    q:"A query runs WHERE DATE(created_at) = '2024-01-15' on a timestamptz column. A B-Tree index on created_at exists but the planner does a sequential scan. Why?",
    opts:["The B-Tree index has become stale since the last ANALYZE run — refreshing statistics will restore index usage","Wrapping a column in DATE() makes it opaque to the planner — a functional index on DATE(created_at) or a range rewrite is needed","The session timezone differs from the storage timezone, forcing a full scan to resolve implicit conversions before filtering","B-Tree indexes on timestamptz columns only activate for range predicates (> or <), not equality predicates"], ans:1 },

  { id:49, cat:"Database Design",
    q:"A strategy reads its own freshly written signal from a read replica and finds nothing — even though it was just committed to the primary. What consistency problem is this?",
    opts:["Dirty read — the replica hasn't yet replayed the uncommitted WAL record","Phantom read — a concurrent transaction deleted the signal between the write and read","Serialisation anomaly — the read and write transactions executed in an order that breaks serializability","Read-your-writes violation — the write committed on the primary but replica lag means the replica hasn't applied it yet"], ans:3 },

  { id:50, cat:"Creative DB Design",
    q:"Six months after go-live, backtests produce different results than the live system produced at the same time. Schema and data have been mutated in-place over time. What is the root cause and correct design?",
    opts:["Updated table statistics from ANALYZE runs caused the query planner to choose different execution paths in backtest vs live","Backtesting needs an immutable point-in-time snapshot of both schema and data — in-place mutations destroy historical reproducibility","The backtest is running on a read replica with replication lag, causing it to read a slightly stale dataset","Index fragmentation has accumulated on the backtest tables, causing different rows to be returned in a different order"], ans:1 },
];

const CAT_META = {
  "Database Design":    { weight:"52%", count:26, accent:"#1D9E75", light:"#E1F5EE", dark:"#085041" },
  "Creative DB Design": { weight:"48%", count:24, accent:"#BA7517", light:"#FAEEDA", dark:"#633806" },
};

const fmt = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

const Badge = ({ cat }) => {
  const m = CAT_META[cat];
  return (
    <span style={{ fontSize:12, fontWeight:500, padding:"3px 10px", borderRadius:6,
      display:"inline-block", background:m.light, color:m.dark }}>{cat}</span>
  );
};

function Welcome({ onStart }) {
  return (
    <div style={{ padding:"1.5rem 0", maxWidth:580, margin:"0 auto" }}>
      <p style={{ fontSize:13, fontFamily:"monospace", color:"#888", margin:"0 0 6px", letterSpacing:"0.04em" }}>
        PHASE 1 · ENGINEER SCREENING
      </p>
      <h2 style={{ fontSize:24, fontWeight:600, margin:"0 0 6px", letterSpacing:"-0.02em" }}>
        Rapid-fire skill test
      </h2>
      <p style={{ color:"#888", fontSize:15, margin:"0 0 2rem" }}>
        50 questions · 10-minute countdown · you may skip any question
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1.5rem" }}>
        {Object.entries(CAT_META).map(([k,m]) => (
          <div key={k} style={{ background:"#f8f8f7", borderRadius:10, padding:"14px 16px", border:"1px solid #e8e8e6" }}>
            <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4,
              background:m.light, color:m.dark, letterSpacing:"0.02em" }}>{m.weight}</span>
            <p style={{ fontSize:14, fontWeight:500, margin:"6px 0 2px", color:"#1a1a1a" }}>{k}</p>
            <p style={{ fontSize:12, color:"#888", margin:0 }}>{m.count} questions</p>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8,
        background:"#f8f8f7", borderRadius:10, padding:"14px 16px",
        border:"1px solid #e8e8e6", marginBottom:"1.5rem" }}>
        {[["≥ 80%","Strong pass","#e1f5ee","#085041"],["60–79%","Borderline","#faeeda","#633806"],["< 60%","Does not meet bar","#fcebeb","#a32d2d"]].map(([pct,label,bg,fg]) => (
          <div key={pct} style={{ textAlign:"center" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{pct}</div>
            <div style={{ fontSize:11, marginTop:3, padding:"2px 6px", borderRadius:4,
              background:bg, color:fg, display:"inline-block" }}>{label}</div>
          </div>
        ))}
      </div>
      <button onClick={onStart} style={{ width:"100%", padding:14, background:"#1a1a1a", color:"#fff",
        border:"none", borderRadius:8, fontSize:15, fontWeight:500, cursor:"pointer", letterSpacing:"0.01em" }}>
        Begin test → 10:00
      </button>
    </div>
  );
}

function Quiz({ onDone }) {
  const [cur, setCur]         = useState(0);
  const [sel, setSel]         = useState(null);
  const [records, setRecords] = useState([]);
  const [tLeft, setTLeft]     = useState(600);
  const busy       = useRef(false);
  const timerRef   = useRef(null);
  const recordsRef = useRef([]);
  const qStartRef  = useRef(Date.now());

  useEffect(() => {
    qStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); onDone(recordsRef.current, 0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [onDone]);

  const advance = (record) => {
    const next = [...recordsRef.current, record];
    recordsRef.current = next;
    setRecords(next);
    setTimeout(() => {
      setSel(null);
      busy.current = false;
      if (cur + 1 >= QUESTIONS.length) { clearInterval(timerRef.current); onDone(next, tLeft); }
      else { setCur(c => c + 1); qStartRef.current = Date.now(); }
    }, record.type === "skipped" ? 0 : 680);
  };

  const pick = (idx) => {
    if (busy.current || sel !== null) return;
    busy.current = true;
    setSel(idx);
    const timeSpent = (Date.now() - qStartRef.current) / 1000;
    advance({ type:"answered", correct: idx === QUESTIONS[cur].ans, sel: idx, correctIdx: QUESTIONS[cur].ans, timeSpent });
  };

  const skip = () => {
    if (busy.current || sel !== null) return;
    busy.current = true;
    advance({ type:"skipped", correctIdx: QUESTIONS[cur].ans, timeSpent: (Date.now() - qStartRef.current) / 1000 });
  };

  const q           = QUESTIONS[cur];
  const answered    = records.filter(r => r.type === "answered");
  const skipped     = records.filter(r => r.type === "skipped");
  const isRed       = tLeft <= 60;
  const isAmb       = tLeft <= 180 && !isRed;
  const catColor    = CAT_META[q.cat].accent;

  return (
    <div style={{ padding:"1.5rem 0", maxWidth:580, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.25rem" }}>
        <Badge cat={q.cat} />
        <span style={{ fontFamily:"monospace", fontSize:22, fontWeight:700, letterSpacing:"0.04em",
          color: isRed ? "#e24b4a" : isAmb ? "#ba7517" : "#1a1a1a" }}>{fmt(tLeft)}</span>
      </div>

      <div style={{ marginBottom:"1.25rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#aaa", marginBottom:6 }}>
          <span>Q{cur+1} / {QUESTIONS.length}</span>
          <span style={{ display:"flex", gap:12 }}>
            <span>{answered.filter(r=>r.correct).length} correct</span>
            {skipped.length > 0 && <span style={{ color:"#ba7517" }}>{skipped.length} skipped</span>}
          </span>
        </div>
        <div style={{ height:3, background:"#ebebeb", borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(cur/QUESTIONS.length)*100}%`,
            background:catColor, borderRadius:2, transition:"width 0.35s ease" }} />
        </div>
      </div>

      <div style={{ background:"#f8f8f7", borderRadius:10, padding:"1.125rem 1.25rem",
        marginBottom:"1rem", border:"1px solid #e8e8e6", borderLeft:`3px solid ${catColor}` }}>
        <p style={{ fontSize:15.5, fontWeight:500, margin:0, lineHeight:1.65, color:"#1a1a1a" }}>{q.q}</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {q.opts.map((opt, i) => {
          let bg = "#fff", border = "1px solid #e0e0e0", color = "#1a1a1a";
          if (sel !== null) {
            if (i === q.ans)                     { bg = "#e1f5ee"; border = "1px solid #1D9E75"; color = "#085041"; }
            else if (i === sel && sel !== q.ans) { bg = "#fcebeb"; border = "1px solid #e24b4a"; color = "#a32d2d"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} disabled={sel !== null}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                background:bg, border, borderRadius:8, cursor: sel!==null?"default":"pointer",
                textAlign:"left", width:"100%", transition:"all 0.18s", color, fontFamily:"inherit" }}>
              <span style={{ width:26, height:26, borderRadius:"50%", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600,
                flexShrink:0, border:"1px solid currentColor", opacity:0.55, color:"inherit" }}>
                {String.fromCharCode(65+i)}
              </span>
              <span style={{ fontSize:14.5 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      <button onClick={skip} disabled={sel !== null}
        style={{ marginTop:12, width:"100%", padding:"9px 14px", background:"transparent",
          border:"1px dashed #ccc", borderRadius:8, fontSize:13, color:"#aaa",
          cursor: sel!==null?"default":"pointer", fontFamily:"inherit", letterSpacing:"0.01em" }}>
        Skip this question →
      </button>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background:"#f8f8f7", border:"1px solid #e8e8e6", borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontSize:11, color:"#aaa", marginBottom:4, letterSpacing:"0.02em" }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:700, fontFamily:"monospace", color:"#1a1a1a", letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#aaa", marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Result({ records, tLeft, onRetake }) {
  const timeTaken  = 600 - tLeft;
  const total      = QUESTIONS.length;
  const answered   = records.filter(r => r.type === "answered");
  const skipped    = records.filter(r => r.type === "skipped");
  const notReached = total - records.length;
  const correct    = answered.filter(r => r.correct).length;
  const pct        = answered.length > 0 ? Math.round((correct / answered.length) * 100) : 0;
  const avgTime    = answered.length > 0
    ? (answered.reduce((s,r) => s + r.timeSpent, 0) / answered.length).toFixed(1)
    : null;

  const verdict = pct >= 80
    ? { t:"Strong pass",       bg:"#e1f5ee", fg:"#085041" }
    : pct >= 60
    ? { t:"Borderline",        bg:"#faeeda", fg:"#633806" }
    : { t:"Does not meet bar", bg:"#fcebeb", fg:"#a32d2d" };

  const cats = Object.entries(CAT_META).map(([k, m]) => {
    const indices = QUESTIONS.map((q,i) => q.cat===k ? i : -1).filter(i => i>=0);
    const catAnswered = indices.filter(i => records[i] && records[i].type==="answered");
    const got = catAnswered.filter(i => records[i].correct).length;
    const skp = indices.filter(i => records[i] && records[i].type==="skipped").length;
    return { k, got, ans:catAnswered.length, skp, tot:m.count, accent:m.accent };
  });

  const totalSkippedOrMissed = skipped.length + notReached;

  return (
    <div style={{ padding:"1.5rem 0", maxWidth:580, margin:"0 auto" }}>
      <p style={{ fontSize:13, fontFamily:"monospace", color:"#aaa", margin:"0 0 8px", letterSpacing:"0.04em" }}>
        ASSESSMENT COMPLETE
      </p>
      <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:"1.5rem" }}>
        <span style={{ fontSize:38, fontWeight:700, fontFamily:"monospace", letterSpacing:"-0.02em", color:"#1a1a1a" }}>
          {correct}/{answered.length}
        </span>
        <span style={{ fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:6,
          background:verdict.bg, color:verdict.fg }}>{verdict.t}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1.5rem" }}>
        <StatCard
          label="QUESTIONS ANSWERED"
          value={answered.length}
          sub={`of ${total} total`} />
        <StatCard
          label="CORRECT ANSWERS"
          value={correct}
          sub={`${pct}% of answered`} />
        <StatCard
          label="QUESTIONS SKIPPED"
          value={totalSkippedOrMissed}
          sub={notReached > 0 ? `${skipped.length} skipped · ${notReached} not reached` : "intentionally skipped"} />
        <StatCard
          label="AVG TIME / QUESTION"
          value={avgTime ? `${avgTime}s` : "—"}
          sub="on answered questions only" />
      </div>

      <div style={{ border:"1px solid #e8e8e6", borderRadius:10, overflow:"hidden", marginBottom:"1.5rem" }}>
        {cats.map(({ k, got, ans, skp, tot, accent }, i) => {
          const pctCat = ans > 0 ? Math.round(got/ans*100) : 0;
          return (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              background:"#fff", borderBottom: i<cats.length-1?"1px solid #f0f0ee":"none" }}>
              <div style={{ width:9, height:9, borderRadius:"50%", flexShrink:0, background:accent }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:"#1a1a1a" }}>{k}</span>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    {skp>0 && <span style={{ fontSize:11, color:"#ba7517" }}>{skp} skipped</span>}
                    <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:600, color:"#888" }}>{got}/{ans}</span>
                  </div>
                </div>
                <div style={{ height:3, background:"#f0f0ee", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pctCat}%`, background:accent, borderRadius:2 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <details style={{ marginBottom:"1.5rem" }}>
        <summary style={{ fontSize:13, fontWeight:500, color:"#888", cursor:"pointer",
          padding:"10px 0", userSelect:"none", listStyle:"none" }}>
          ▸ Review all answers
        </summary>
        <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:8 }}>
          {QUESTIONS.map((q, i) => {
            const r          = records[i];
            const wasSkipped = !r || r.type === "skipped";
            const isCorrect  = r && r.type === "answered" && r.correct;
            const bg    = wasSkipped ? "#f8f8f7" : isCorrect ? "#e1f5ee" : "#fcebeb";
            const bdr   = wasSkipped ? "#e0e0e0"  : isCorrect ? "#1D9E75"  : "#e24b4a";
            const lc    = wasSkipped ? "#aaa"      : isCorrect ? "#085041"  : "#a32d2d";
            const tag   = wasSkipped ? (r ? "skipped" : "—") : (isCorrect ? "✓" : "✗");
            return (
              <div key={q.id} style={{ background:bg, border:`1px solid ${bdr}`, borderRadius:8, padding:"10px 14px" }}>
                <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:11, fontWeight:600, flexShrink:0, marginTop:1, color:lc }}>Q{q.id} {tag}</span>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, margin:"0 0 4px", color:"#1a1a1a", fontWeight:500 }}>{q.q}</p>
                    <p style={{ fontSize:12, margin:0, color:lc }}>
                      {wasSkipped
                        ? `Correct answer: ${q.opts[q.ans]}`
                        : isCorrect
                        ? q.opts[q.ans]
                        : `You chose: ${q.opts[r.sel]} · Correct: ${q.opts[q.ans]}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </details>

      <button onClick={onRetake}
        style={{ width:"100%", padding:14, background:"transparent", border:"1px solid #ccc",
          borderRadius:8, fontSize:15, fontWeight:500, cursor:"pointer", color:"#1a1a1a" }}>
        Retake test
      </button>
    </div>
  );
}

function App() {
  const [phase,   setPhase]   = useState("welcome");
  const [results, setResults] = useState(null);

  const handleDone = (records, tLeft) => { setResults({ records, tLeft }); setPhase("result"); };

  if (phase === "welcome") return <Welcome onStart={() => setPhase("quiz")} />;
  if (phase === "quiz")    return <Quiz onDone={handleDone} />;
  return <Result {...results} onRetake={() => setPhase("welcome")} />;
}
