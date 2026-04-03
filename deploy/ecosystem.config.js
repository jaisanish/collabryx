module.exports = {
  apps: [
    {
      name: 'collabryx-backend',
      script: 'dist/server.js', // Production entry point after 'npm run build'
      cwd: './backend',        // Run from the backend directory
      instances: 1,            // Number of instances to run (1 is safe for low-tier EC2)
      autorestart: true,       // Restart if the app crashes
      watch: false,            // Don't watch files in production
      max_memory_restart: '1G', // Restart if RAM exceeds 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3000             // Run on port 3000 as requested for Nginx proxy
      }
    }
  ]
};
