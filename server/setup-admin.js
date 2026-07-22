const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./database');

const setupAdmin = async () => {
  try {
    console.log('Initializing database and creating admin account...');
    
    initializeDatabase();
    
    setTimeout(async () => {
      const adminEmail = 'arjun@psychiatry.health';
      const adminPassword = 'AdminPassword123!';
      const adminName = 'Arjun Mahadevan';
      
      db.get('SELECT * FROM registrars WHERE email = ?', [adminEmail], async (err, row) => {
        if (err) {
          console.error('Database error:', err);
          process.exit(1);
        }
        
        if (row) {
          console.log('Admin account already exists.');
          console.log(`Email: ${adminEmail}`);
          console.log(`Password: ${adminPassword}`);
          db.close();
          process.exit(0);
        }
        
        try {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          const adminId = Math.random().toString(36).substr(2, 9);
          
          db.run(
            'INSERT INTO registrars (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [adminId, adminName, adminEmail, hashedPassword, 'admin'],
            (err) => {
              if (err) {
                console.error('Error creating admin:', err);
                process.exit(1);
              }
              
              console.log('\n✅ Admin account created successfully!\n');
              console.log('Admin Credentials:');
              console.log(`  Email: ${adminEmail}`);
              console.log(`  Password: ${adminPassword}`);
              console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');
              
              db.close();
              process.exit(0);
            }
          );
        } catch (error) {
          console.error('Error hashing password:', error);
          process.exit(1);
        }
      });
    }, 1000);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
};

setupAdmin();
