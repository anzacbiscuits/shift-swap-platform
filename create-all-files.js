const fs = require('fs');
const path = require('path');

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

// Server package.json
createFile('server/package.json', `{
  "name": "shift-swap-server",
  "version": "1.0.0",
  "description": "Backend for psychiatry shift swap platform",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "setup": "node setup-admin.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "body-parser": "^1.20.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  },
  "engines": {
    "node": "18.x"
  }
}
`);

// Server database.js
createFile('server/database.js', `const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'shiftswap.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(\`
      CREATE TABLE IF NOT EXISTS registrars (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'registrar',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS swaps (
        id TEXT PRIMARY KEY,
        registrar_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registrar_id) REFERENCES registrars(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS swap_give_shifts (
        id TEXT PRIMARY KEY,
        swap_id TEXT NOT NULL,
        date TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        FOREIGN KEY (swap_id) REFERENCES swaps(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS swap_unavailable (
        id TEXT PRIMARY KEY,
        swap_id TEXT NOT NULL,
        date_start TEXT NOT NULL,
        date_end TEXT NOT NULL,
        time_slots TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (swap_id) REFERENCES swaps(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS swap_preferred_times (
        id TEXT PRIMARY KEY,
        swap_id TEXT NOT NULL,
        date_start TEXT NOT NULL,
        date_end TEXT NOT NULL,
        morning BOOLEAN DEFAULT 0,
        evening BOOLEAN DEFAULT 0,
        night BOOLEAN DEFAULT 0,
        FOREIGN KEY (swap_id) REFERENCES swaps(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS completed_swaps (
        id TEXT PRIMARY KEY,
        swap_id_1 TEXT NOT NULL,
        swap_id_2 TEXT NOT NULL,
        registrar_1_id TEXT NOT NULL,
        registrar_2_id TEXT NOT NULL,
        registrar_1_gives_date TEXT NOT NULL,
        registrar_1_gives_shift TEXT NOT NULL,
        registrar_2_gives_date TEXT NOT NULL,
        registrar_2_gives_shift TEXT NOT NULL,
        accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (swap_id_1) REFERENCES swaps(id),
        FOREIGN KEY (swap_id_2) REFERENCES swaps(id),
        FOREIGN KEY (registrar_1_id) REFERENCES registrars(id),
        FOREIGN KEY (registrar_2_id) REFERENCES registrars(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        recipient_id TEXT NOT NULL,
        completed_swap_id TEXT,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES registrars(id),
        FOREIGN KEY (recipient_id) REFERENCES registrars(id),
        FOREIGN KEY (completed_swap_id) REFERENCES completed_swaps(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS swap_offers (
        id TEXT PRIMARY KEY,
        swap_id_1 TEXT NOT NULL,
        swap_id_2 TEXT NOT NULL,
        registrar_1_id TEXT NOT NULL,
        registrar_2_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (swap_id_1) REFERENCES swaps(id),
        FOREIGN KEY (swap_id_2) REFERENCES swaps(id),
        FOREIGN KEY (registrar_1_id) REFERENCES registrars(id),
        FOREIGN KEY (registrar_2_id) REFERENCES registrars(id)
      )
    \`);

    db.run(\`
      CREATE TABLE IF NOT EXISTS giveaways (
        id TEXT PRIMARY KEY,
        registrar_id TEXT NOT NULL,
        date TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        claimed_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registrar_id) REFERENCES registrars(id),
        FOREIGN KEY (claimed_by) REFERENCES registrars(id)
      )
    \`);

    console.log('Database initialized successfully');
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

module.exports = {
  db,
  initializeDatabase,
  dbRun,
  dbGet,
  dbAll
};
`);

console.log('\\n✅ All files created successfully!');
console.log('\\nNext steps:');
console.log('1. npm run install-all');
console.log('2. cd server && npm run setup');
console.log('3. npm run dev');
