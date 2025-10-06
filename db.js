const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databasePath =
  process.env.SQLITE_DB_PATH || path.join(__dirname, "data", "satellites.db");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error("Failed to open sqlite database", err);
  }
});

let isClosed = false;

function runSilently(sql) {
  db.run(sql, (err) => {
    if (err) {
      console.error(`SQLite error executing: ${sql}`, err);
    }
  });
}

function addColumnIfMissing(table, column, definition) {
  db.all(`PRAGMA table_info(${table});`, (err, rows) => {
    if (err) {
      console.error(`Failed to inspect table ${table}`, err);
      return;
    }

    const exists = rows.some((row) => row.name === column);
    if (!exists) {
      db.run(
        `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
        (alterErr) => {
          if (alterErr) {
            console.error(
              `Failed to add column ${column} to table ${table}`,
              alterErr
            );
          }
        }
      );
    }
  });
}

db.serialize(() => {
  runSilently("PRAGMA journal_mode = WAL;");
  runSilently("PRAGMA foreign_keys = ON;");
  runSilently("PRAGMA temp_store = MEMORY;");

  runSilently(`
    CREATE TABLE IF NOT EXISTS satellites (
      satellite_id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      object_id TEXT,
      object_type TEXT,
      status TEXT,
      owner TEXT,
      launch_date TEXT,
      launch_site TEXT,
      revolution REAL,
      inclination REAL,
      farthest_orbit_distance REAL,
      lowest_orbit_distance REAL,
      rcs REAL,
      description TEXT,
      country_code TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  runSilently(`
    CREATE TABLE IF NOT EXISTS satellite_data (
      satellite_id INTEGER PRIMARY KEY,
      tle_line1 TEXT NOT NULL,
      tle_line2 TEXT NOT NULL,
      epoch TEXT,
      mean_motion_dot REAL,
      mean_motion_ddot REAL,
      eccentricity REAL,
      ra_of_asc_node REAL,
      arg_of_pericenter REAL,
      mean_anomaly REAL,
      bstar REAL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (satellite_id) REFERENCES satellites (satellite_id) ON DELETE CASCADE
    )
  `);

  runSilently(`
    CREATE TABLE IF NOT EXISTS top_collision_probabilities (
      satellite_id INTEGER PRIMARY KEY,
      probability REAL,
      details TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  addColumnIfMissing("satellites", "status", "TEXT");
  addColumnIfMissing("satellites", "rcs", "REAL");
  addColumnIfMissing("satellites", "description", "TEXT");
  addColumnIfMissing("satellites", "country_code", "TEXT");
  addColumnIfMissing(
    "satellites",
    "updated_at",
    "TEXT DEFAULT CURRENT_TIMESTAMP"
  );

  addColumnIfMissing("satellite_data", "epoch", "TEXT");
  addColumnIfMissing("satellite_data", "mean_motion_dot", "REAL");
  addColumnIfMissing("satellite_data", "mean_motion_ddot", "REAL");
  addColumnIfMissing("satellite_data", "eccentricity", "REAL");
  addColumnIfMissing("satellite_data", "ra_of_asc_node", "REAL");
  addColumnIfMissing("satellite_data", "arg_of_pericenter", "REAL");
  addColumnIfMissing("satellite_data", "mean_anomaly", "REAL");
  addColumnIfMissing("satellite_data", "bstar", "REAL");
  addColumnIfMissing(
    "satellite_data",
    "updated_at",
    "TEXT DEFAULT CURRENT_TIMESTAMP"
  );
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const trimmed = sql.trim().toLowerCase();
    const isSelect = trimmed.startsWith("select");

    if (isSelect) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve({ rows });
      });
    } else {
      db.run(sql, params, function runCallback(err) {
        if (err) {
          return reject(err);
        }
        resolve({ rows: [], lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

function close() {
  return new Promise((resolve, reject) => {
    if (isClosed) {
      return resolve();
    }
    db.close((err) => {
      if (err) {
        return reject(err);
      }
      isClosed = true;
      resolve();
    });
  });
}

function getDatabase() {
  return db;
}

module.exports = {
  query,
  close,
  getDatabase,
  databasePath,
};
