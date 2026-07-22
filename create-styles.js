const fs = require('fs');

function createFile(filePath, content) {
  const dir = require('path').dirname(filePath);
  require('fs').mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

// Auth.css
createFile('client/src/styles/Auth.css', `.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.auth-card h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.toggle-text {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.toggle-btn {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1rem;
  padding: 0;
}

.toggle-btn:hover {
  color: #2980b9;
}

.toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`);

// Dashboard.css
createFile('client/src/styles/Dashboard.css', `.dashboard h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #666;
  font-size: 1.1rem;
}

.recent-swaps {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-swaps h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.swaps-list {
  display: grid;
  gap: 1rem;
}

.swap-item {
  background: #f9f9f9;
  padding: 1.5rem;
  border-left: 4px solid #3498db;
  border-radius: 4px;
  position: relative;
}

.swap-item.completed {
  border-left-color: #27ae60;
  opacity: 0.8;
}

.swap-status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #3498db;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  text-transform: uppercase;
  font-weight: 500;
}

.swap-item.completed .swap-status-badge {
  background: #27ae60;
}

.swap-item p {
  margin: 0.5rem 0;
  color: #333;
}
`);

// SwapBoard.css
createFile('client/src/styles/SwapBoard.css', `.swap-board-container {
  padding: 2rem;
}

.swap-board-container h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.board-legend {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.board-legend div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.legend-red { color: #e74c3c; font-size: 1.2rem; }
.legend-green { color: #27ae60; font-size: 1.2rem; }
.legend-grey { color: #95a5a6; font-size: 1.2rem; }

.board-scroll {
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.swap-board {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.swap-board thead {
  background-color: #2c3e50;
  color: white;
  position: sticky;
  top: 0;
}

.swap-board th {
  padding: 0.75rem 0.5rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.name-column {
  text-align: left;
  min-width: 120px;
  position: sticky;
  left: 0;
  background-color: #2c3e50;
  z-index: 10;
}

.date-header { min-width: 70px; }

.swap-board tbody tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.swap-board tbody tr:hover {
  background-color: #f0f0f0;
}

.registrar-row td {
  padding: 1rem 0.5rem;
  text-align: center;
  border: 1px solid #e0e0e0;
  vertical-align: middle;
  height: 60px;
}

.name-column {
  position: sticky;
  left: 0;
  background-color: white;
  padding-left: 1rem;
  text-align: left;
  z-index: 5;
}

.registrar-row:nth-child(odd) .name-column {
  background-color: #f9f9f9;
}

.shift {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  min-width: 35px;
}

.shift-red { background-color: #e74c3c; color: white; }
.shift-green { background-color: #27ae60; color: white; }
.shift-unavailable { background-color: #bdc3c7; color: #333; }
`);

// CreateSwap.css
createFile('client/src/styles/CreateSwap.css', `.create-swap {
  max-width: 600px;
}

.create-swap h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.step {
  flex: 1;
  padding: 1rem;
  background: #ecf0f1;
  border-radius: 4px;
  text-align: center;
  color: #666;
  font-weight: 500;
  transition: all 0.3s;
}

.step.active {
  background: #3498db;
  color: white;
}

.form-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.checkbox-group {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.added-items {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
}

.added-items h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.item-badge {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  border-left: 4px solid #3498db;
}

.item-badge span {
  flex: 1;
  color: #333;
  font-size: 0.95rem;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.remove-btn:hover { background: #c0392b; }

.step-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: space-between;
}

.step-buttons .btn { flex: 1; }
`);

// Messages.css
createFile('client/src/styles/Messages.css', `.messages-container {
  padding: 2rem;
}

.messages-container h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.messages-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1.5rem;
  height: 600px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.registrar-list {
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  padding: 1rem;
}

.registrar-list h2 {
  font-size: 1rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.registrar-item {
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.registrar-item:hover { background: #f5f5f5; }

.registrar-item.active {
  background: #3498db;
  color: white;
  border-left-color: #2980b9;
}

.registrar-item strong { display: block; margin-bottom: 0.25rem; }
.registrar-item small { display: block; font-size: 0.75rem; opacity: 0.8; }

.conversation-panel {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.conversation-panel h2 {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  max-width: 80%;
}

.message.sent {
  align-self: flex-end;
  background: #3498db;
  color: white;
}

.message.received {
  align-self: flex-start;
  background: #ecf0f1;
  color: #333;
}

.message-header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.message-header strong { font-size: 0.9rem; }
.message-header small { font-size: 0.75rem; opacity: 0.7; }

.message-content {
  word-wrap: break-word;
  font-size: 0.95rem;
}

.message-form {
  display: flex;
  gap: 0.5rem;
}

.message-form input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.message-form input:focus {
  outline: none;
  border-color: #3498db;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 1.1rem;
}
`);

// Admin.css
createFile('client/src/styles/Admin.css', `.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-container h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover { color: #3498db; }
.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.admin-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-registrar {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.create-registrar h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.create-registrar form {
  max-width: 400px;
}

.registrars-list,
.swaps-list {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.registrars-list h2,
.swaps-list h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
}

.admin-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.admin-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
}

.admin-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.admin-table tbody tr:hover {
  background-color: #f9f9f9;
}

.role-badge,
.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge {
  background-color: #3498db;
  color: white;
}

.status-badge {
  background-color: #95a5a6;
  color: white;
}

.status-badge.active { background-color: #27ae60; }
.status-badge.completed { background-color: #f39c12; }

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}
`);

console.log('\\n✅ All CSS files created!');
console.log('Next: Create root config files...');
