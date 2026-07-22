const fs = require('fs');
const path = require('path');

// Create directories
const dirs = [
  'server/routes',
  'server/middleware',
  'client/src/pages',
  'client/src/styles',
  'client/public'
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

console.log('✅ Directories created');
console.log('Now run: npm run install-all');
