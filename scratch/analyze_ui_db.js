const fs = require('fs');
const path = require('path');

// 1. Get database columns
const sql = fs.readFileSync('supabase/migrations/20260916144330_remote_schema.sql', 'utf8');
const match = sql.match(/create table "public"\."startups" \(([\s\S]*?)\);/);
const dbCols = new Set();
if (match) {
  match[1].split('\n').forEach(l => {
    const t = l.trim();
    if (t.startsWith('"')) dbCols.add(t.split('"')[1]);
  });
}
dbCols.add('application_id');

console.log('Database Columns Count:', dbCols.size);

// 2. Scan all UI files in startup-dashboard and startup-profile
const uiDirs = [
  'src/frontend/components/startup-dashboard',
  'src/frontend/components/startup-profile',
  'src/app/startup',
  'src/app/api/v1/startups'
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) getAllFiles(full, fileList);
    else if (full.endsWith('.ts') || full.endsWith('.tsx')) fileList.push(full);
  }
  return fileList;
}

const allUiFiles = [];
uiDirs.forEach(d => getAllFiles(d, allUiFiles));

console.log('Scanned UI & API Files Count:', allUiFiles.length);

// Check references
const startupPropRegex = /(?:startup|formData|profile|st)\.([a-zA-Z0-9_]+)/g;
const referencedFields = new Set();

allUiFiles.forEach(f => {
  const code = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = startupPropRegex.exec(code)) !== null) {
    const prop = m[1];
    // Exclude built-in JS/React methods
    if (!['map', 'filter', 'length', 'slice', 'toLowerCase', 'toUpperCase', 'split', 'trim', 'toString', 'replace', 'startsWith'].includes(prop)) {
      referencedFields.add(prop);
    }
  }
});

console.log('\n--- ALL REFERENCED UI/API FIELDS ON STARTUP (' + referencedFields.size + ') ---');
const sortedFields = Array.from(referencedFields).sort();
console.log(sortedFields);

console.log('\n--- MISSING FROM DATABASE TABLE (startups) ---');
const missing = sortedFields.filter(f => !dbCols.has(f));
console.log(missing);

