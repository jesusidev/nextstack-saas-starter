#!/usr/bin/env node

const { spawn } = require('node:child_process');

// Run biome format with proper error handling
function formatFiles() {
  const biome = spawn('npx', ['biome', 'format', '--write', '.'], {
    cwd: process.cwd(),
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  let hasOutput = false;

  biome.stdout.on('data', (data) => {
    if (!hasOutput) {
      console.log('\n🎨 Formatting files...');
      hasOutput = true;
    }
    process.stdout.write(data);
  });

  biome.stderr.on('data', (data) => {
    // Only show actual errors, not warnings
    const message = data.toString();
    if (message.includes('error') || message.includes('Error')) {
      process.stderr.write(data);
    }
  });

  biome.on('close', () => {
    if (hasOutput) {
      console.log('✅ Formatting complete\n');
    }
  });

  biome.on('error', (err) => {
    console.error('❌ Format error:', err.message);
  });
}

// Export the function for use
module.exports = formatFiles;

// If called directly, run the function
if (require.main === module) {
  formatFiles();
}
