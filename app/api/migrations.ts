import { db } from "./database";

const tableExists = (tableName: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
};

export const migrate = async () => {
  const tableName = "tasks";
  const tableSQL = `
    CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      assignee TEXT CHECK(assignee IN ('Evan', 'Ellie', 'Asher', 'Owen', 'Katie', 'Eric')),
      due_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT,
      type TEXT,
      priority TEXT,
      status TEXT CHECK(status IN ('incomplete', 'complete')) DEFAULT 'incomplete',
      start_date DATETIME,
      recurrence TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const exists = await tableExists(tableName);
  if (!exists) {
    db.run(tableSQL, (err: Error | null) => {
      if (err) {
        console.error(`Error creating ${tableName}:`, err.message);
      } else {
        console.log(`${tableName} table created successfully.`);
      }
    });
  } else {
    console.log(`${tableName} table already exists. Skipping.`);
  }
};