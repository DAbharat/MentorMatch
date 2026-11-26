const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read .env if available to fetch ACCESS_TOKEN_SECRET
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env');
    const envVars = {};
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...values] = trimmed.split('=');
                envVars[key.trim()] = values.join('=').trim();
            }
        }
    }
    return envVars;
}

const envVars = loadEnv();
const args = process.argv.slice(2);

// Check if deployed flag is passed
const isDeployed = args.some(arg => arg.toLowerCase().includes('deployed'));
const target = isDeployed ? 'deployed' : 'local';

console.log(`[Load Test] Target environment: ${target.toUpperCase()}`);
if (isDeployed) {
    console.log('[Load Test] Endpoint: wss://socket-deploy.com/ws');
} else {
    console.log('[Load Test] Endpoint: ws://localhost:3001/ws');
}

const env = {
    ...process.env,
    TARGET: target,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || envVars.ACCESS_TOKEN_SECRET || '',
};

const scriptPath = path.join(__dirname, 'loadtest.js');

const k6Process = spawn('k6', ['run', scriptPath, '-e', `TARGET=${target}`], {
    stdio: 'inherit',
    env: env,
    shell: true,
});

k6Process.on('close', (code) => {
    console.log(`[Load Test] Completed with exit code ${code}`);
    process.exit(code);
});

