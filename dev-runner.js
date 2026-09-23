import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

console.log('🚀 Starting UZDEM LMS Environment with .env configuration...');

// Zero-dependency .env loader using standard Node.js
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch (err) {
    console.warn(`Could not read env file ${filePath}:`, err.message);
  }
}

// Load .env configuration (backend/.env priority, fallback to root .env)
const backendEnvPath = path.join(process.cwd(), 'backend', '.env');
const rootEnvPath = path.join(process.cwd(), '.env');

loadEnvFile(backendEnvPath);
loadEnvFile(rootEnvPath);

const backendEnv = {
  ...process.env,
  PORT: '3001',
  BACKEND_PORT: '3001',
};

const frontendEnv = {
  ...process.env,
  PORT: '3000',
};

const maskedDb = process.env.DATABASE_URL
  ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')
  : 'Default';
console.log(`📡 Database target: ${maskedDb}`);

const distPath = path.join(process.cwd(), 'backend', 'dist', 'main.js');
if (!fs.existsSync(distPath)) {
  console.log('📦 backend/dist/main.js not found. Building backend...');
  try {
    execSync('npm run build --workspace=backend', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Failed to build backend:', err);
  }
}

const backend = spawn('node', ['backend/dist/main.js'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true,
  env: backendEnv,
});

const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
  cwd: path.join(process.cwd(), 'frontend'),
  stdio: 'inherit',
  shell: true,
  env: frontendEnv,
});

function cleanup() {
  console.log('🛑 Shutting down backend and frontend services...');
  try {
    backend.kill();
  } catch {}
  try {
    frontend.kill();
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
