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
  const tablesToCreate = [
    {
      name: "users",
      sql: `
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT NOT NULL,
          birthday DATE,
          avatar_url TEXT,
          phone TEXT,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        );
      `,
    },
    {
      name: "groups",
      sql: `
        CREATE TABLE groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );
      `,
    },
    {
      name: "user_groups",
      sql: `
        CREATE TABLE user_groups (
          user_id INTEGER NOT NULL,
          group_id INTEGER NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(group_id) REFERENCES groups(id),
          PRIMARY KEY(user_id, group_id)
        );
      `,
    },
    {
      name: "tasks",
      sql: `
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK(type IN ('chore', 'goal', 'task')) NOT NULL,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('future', 'in_progress', 'completed')) DEFAULT 'future',
  start_date DATETIME,
  due_date DATETIME,
  recurrence TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
      `,
    },
    {
      name: "task_assignments",
      sql: `
        CREATE TABLE task_assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(task_id) REFERENCES tasks(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
    },
    {
      name: "task_status",
      sql: `
        CREATE TABLE task_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY(task_id) REFERENCES tasks(id),
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `,
    },
  ];

  for (const table of tablesToCreate) {
    const exists = await tableExists(table.name);
    if (!exists) {
      db.run(table.sql, (err: Error | null) => {
        if (err) {
          console.error(`Error creating ${table.name}:`, err.message);
        } else {
          console.log(`${table.name} table created successfully.`);
        }
      });
    } else {
      console.log(`${table.name} table already exists. Skipping.`);
    }
  }
};