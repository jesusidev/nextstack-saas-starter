// ==============================================================================
// Health Check Script for Docker Containers
// Validates application health for container orchestration
// ==============================================================================

const http = require('node:http');

const healthCheck = {
  host: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  timeout: 5000,
};

const request = http.request(
  {
    host: healthCheck.host,
    port: healthCheck.port,
    path: healthCheck.path,
    method: 'GET',
    timeout: healthCheck.timeout,
  },
  (res) => {
    console.log(`Health check status: ${res.statusCode}`);

    if (res.statusCode === 200) {
      process.exit(0);
    } else {
      console.error(`Health check failed with status: ${res.statusCode}`);
      process.exit(1);
    }
  }
);

request.on('error', (err) => {
  console.error('Health check request failed:', err.message);
  process.exit(1);
});

request.on('timeout', () => {
  console.error('Health check request timed out');
  request.destroy();
  process.exit(1);
});

request.end();
