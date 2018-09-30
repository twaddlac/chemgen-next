module.exports = {
  apps : [
    {
      name: "chemgen-next-server",
      script: "server/server.js",
      watch: false,
      env: {
        "PORT": 3000,
        "NODE_ENV": "development"
      },
      env_production: {
        "PORT": 3000,
        "NODE_ENV": "production",
      }
    }
  ]
}
