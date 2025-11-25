// proxy/config/config.js
const convict = require('convict');
require('dotenv').config();

const config = convict({
  env: {
    doc: 'Application environment',
    format: ['production', 'development', 'test'],
    default: process.env.NODE_ENV || 'development',
    env: 'NODE_ENV'
  },
  api: {
    url: {
      doc: "API URL",
      format: String,  
      default: "http://localhost:3000",
      env: "API_URL"
    }
  },
  server: {
    port: {
      doc: 'Port to bind',
      format: 'port',
      default: process.env.PORT ? parseInt(process.env.PORT,10) : 3001,
      env: 'PORT'
    }
  }
});

config.validate({ allowed: 'strict' });

module.exports = config;