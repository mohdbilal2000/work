const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'induction.json');

// Initialize database file if it doesn't exist
function init() {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({ records: [], nextId: 1 }, null, 2));
        console.log('✅ Induction database created at:', dbPath);
      } else {
        console.log('✅ Induction database loaded from:', dbPath);
      }
      resolve();
    } catch (error) {
      console.error('Error initializing induction database:', error);
      reject(error);
    }
  });
}

function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({ records: [], nextId: 1 }, null, 2));
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { records: [], nextId: 1 };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
}

// Get all records
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const data = readDb();
      resolve(data.records);
    } catch (error) {
      reject(error);
    }
  });
}

// Get single record by ID
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const data = readDb();
      const id = params[0];
      
      // Check if looking by employee_id or id
      if (sql.includes('employee_id')) {
        const record = data.records.find(r => r.employee_id === id);
        resolve(record);
      } else {
        const record = data.records.find(r => r.id === parseInt(id));
        resolve(record);
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Run insert/update/delete
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const data = readDb();
      const now = new Date().toISOString();
      
      if (sql.includes('INSERT INTO')) {
        // Insert new record
        const newRecord = {
          id: data.nextId,
          employee_name: params[0] || '',
          employee_id: params[1] || '',
          department: params[2] || '',
          designation: params[3] || '',
          joining_date: params[4] || null,
          induction_date: params[5] || null,
          induction_status: params[6] || 'pending',
          trainer_name: params[7] || '',
          training_topics: params[8] || '',
          documents_submitted: params[9] ? true : false,
          id_card_issued: params[10] ? true : false,
          system_access_granted: params[11] ? true : false,
          remarks: params[12] || '',
          created_at: now,
          updated_at: now
        };
        
        data.records.push(newRecord);
        data.nextId++;
        writeDb(data);
        resolve({ lastID: newRecord.id, changes: 1 });
      } else if (sql.includes('UPDATE')) {
        // Update existing record
        if (sql.includes('WHERE employee_id')) {
          // Update by employee_id (for remarks update)
          const employeeId = params[params.length - 1];
          const index = data.records.findIndex(r => r.employee_id === employeeId);
          
          if (index !== -1) {
            data.records[index].remarks = params[0];
            data.records[index].updated_at = now;
            writeDb(data);
            resolve({ lastID: data.records[index].id, changes: 1 });
          } else {
            resolve({ lastID: null, changes: 0 });
          }
        } else {
          // Update by id (full update)
          const id = parseInt(params[params.length - 1]);
          const index = data.records.findIndex(r => r.id === id);
          
          if (index !== -1) {
            data.records[index] = {
              ...data.records[index],
              employee_name: params[0] || '',
              employee_id: params[1] || '',
              department: params[2] || '',
              designation: params[3] || '',
              joining_date: params[4] || null,
              induction_date: params[5] || null,
              induction_status: params[6] || 'pending',
              trainer_name: params[7] || '',
              training_topics: params[8] || '',
              documents_submitted: params[9] ? true : false,
              id_card_issued: params[10] ? true : false,
              system_access_granted: params[11] ? true : false,
              remarks: params[12] || '',
              updated_at: now
            };
            writeDb(data);
            resolve({ lastID: id, changes: 1 });
          } else {
            resolve({ lastID: null, changes: 0 });
          }
        }
      } else if (sql.includes('DELETE')) {
        // Delete record
        const id = parseInt(params[0]);
        const initialLength = data.records.length;
        data.records = data.records.filter(r => r.id !== id);
        writeDb(data);
        resolve({ lastID: null, changes: initialLength - data.records.length });
      } else {
        resolve({ lastID: null, changes: 0 });
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  init,
  dbAll,
  dbGet,
  dbRun
};
