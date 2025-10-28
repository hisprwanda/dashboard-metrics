#!/usr/bin/env node

const { spawn } = require('child_process');
const { platform } = require('os');

// Get proxy URL from command line arguments
const proxyUrl = process.argv[2];

if (!proxyUrl) {
  console.error('Error: Please provide a proxy URL');
  console.log('Usage: node scripts/start-with-proxy.js <proxy-url>');
  console.log('Example: node scripts/start-with-proxy.js https://play.im.dhis2.org/stable-2-42-1');
  process.exit(1);
}

// Validate URL format
try {
  new URL(proxyUrl);
} catch (error) {
  console.error('Error: Invalid URL format');
  console.log('Please provide a valid URL starting with http:// or https://');
  process.exit(1);
}

console.log(`🚀 Starting development server with proxy: ${proxyUrl}`);

// Determine the correct command based on platform
const isWindows = platform() === 'win32';
const yarnCommand = isWindows ? 'yarn.cmd' : 'yarn';

// Start CSS watching and dev server concurrently
const concurrentlyArgs = [
  'yarn watch:css',
  `d2-app-scripts start --proxy ${proxyUrl}`
];

const child = spawn(yarnCommand, ['concurrently', ...concurrentlyArgs.map(cmd => `"${cmd}"`)], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

child.on('exit', (code) => {
  process.exit(code);
});