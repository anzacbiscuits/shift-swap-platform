const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'shiftswap.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS registrars (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'registrar',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS swaps (
        id TEXT PRIMARY KEY,
        registrar_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registrar_id) REFERENCES registrars(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS swap_give_shifts (
        id TEXT PRIMARY KEY,
        swap_id TEXT NOT NULL,
        date TEXT NOT NULL,
        shift_type TEXT NOT NULL,
        FOREIGN KEY (swap_id) REFERENCES swaps(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS swap_unavailable (
        id TEXT PRIMARY KEY,
        swap_id TEXT NOT NULL,
        date_start TEXT NOT NULL,
        date_end TEXT NOT NULL,
        time_slots TEXT NOT NULL,
        reason TEXT,
        FOREIGN KEY (swap_id) REFERENCES swaps(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS swap_preferred_times (
        id TEXT PRIMARY KEY,
        swap_id TEXT NOT NULL,
        date_start TEXT NOT NULL,
        date_end TEXT NOT NULL,
        morning BOOLEAN DEFAULT 0,
        evening BOOLEAN DEFAULT 0,
        night BOOLEAN DEFAULT 0,
        shift_types TEXT DEFAULT '[]',
        FOREIGN KEY (swap_id) REFERENCES swaps(id)
      )
    `);

    db.run(`
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
    `);

    db.run(`
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
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS swap_offers (
        id TEXT PRIMARY KEY,
        swap_id_1 TEXT NOT NULL,
        swap_id_2 TEXT NOT NULL,
        registrar_1_id TEXT NOT NULL,
        registrar_2_id TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        give1_date TEXT,
        give1_shift TEXT,
        give2_date TEXT,
        give2_shift TEXT,
        reg1_accepted INTEGER DEFAULT 0,
        reg2_accepted INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (swap_id_1) REFERENCES swaps(id),
        FOREIGN KEY (swap_id_2) REFERENCES swaps(id),
        FOREIGN KEY (registrar_1_id) REFERENCES registrars(id),
        FOREIGN KEY (registrar_2_id) REFERENCES registrars(id)
      )
    `);

    db.run(`
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
    `);

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

// Additive schema migrations for existing databases (safe to run every startup).
const runMigrations = async () => {
  try {
    const cols = await dbAll("PRAGMA table_info(swap_preferred_times)");
    if (cols.length && !cols.some(c => c.name === 'shift_types')) {
      await dbRun("ALTER TABLE swap_preferred_times ADD COLUMN shift_types TEXT DEFAULT '[]'");
      console.log('Migration: added shift_types column to swap_preferred_times');
    }

    const offerCols = await dbAll("PRAGMA table_info(swap_offers)");
    if (offerCols.length) {
      const want = [
        ['give1_date', 'TEXT'], ['give1_shift', 'TEXT'],
        ['give2_date', 'TEXT'], ['give2_shift', 'TEXT'],
        ['reg1_accepted', 'INTEGER DEFAULT 0'], ['reg2_accepted', 'INTEGER DEFAULT 0']
      ];
      for (const [name, type] of want) {
        if (!offerCols.some(c => c.name === name)) {
          await dbRun(`ALTER TABLE swap_offers ADD COLUMN ${name} ${type}`);
          console.log(`Migration: added ${name} column to swap_offers`);
        }
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

const bcrypt = require('bcryptjs');

// Idempotently ensure an admin account exists on startup. Credentials come from
// env vars (set these in Railway); defaults are provided for local testing.
const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'arjun@psychiatry.health';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const adminName = process.env.ADMIN_NAME || 'Arjun Mahadevan';
  try {
    const existing = await dbGet('SELECT id FROM registrars WHERE email = ?', [adminEmail]);
    if (existing) {
      console.log(`Admin account already present (${adminEmail}).`);
      return;
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = Math.random().toString(36).substr(2, 9);
    await dbRun(
      'INSERT INTO registrars (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [adminId, adminName, adminEmail, hashedPassword, 'admin']
    );
    console.log(`✅ Admin account seeded (${adminEmail}).`);
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
};

module.exports = {
  db,
  initializeDatabase,
  runMigrations,
  seedAdmin,
  dbRun,
  dbGet,
  dbAll
};
