const fs = require('fs');

// 1. Read migration schema
const sql = fs.readFileSync('supabase/migrations/20260916144330_remote_schema.sql', 'utf8');
const regex = /create table "public"\."startups" \(([\s\S]*?)\);/;
const match = sql.match(regex);
const schemaCols = [];

if (match) {
  const lines = match[1].split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('"')) {
      const col = trimmed.split('"')[1];
      schemaCols.push(col);
    }
  }
}

// 2. Read security migration
const secSql = fs.readFileSync('supabase/migrations/20261102_superadmin_and_role_security.sql', 'utf8');
if (secSql.includes('application_id')) {
  schemaCols.push('application_id');
}

console.log('--- DATABASE COLUMNS IN STARTUPS TABLE (' + schemaCols.length + ') ---');
console.log(schemaCols.sort());

