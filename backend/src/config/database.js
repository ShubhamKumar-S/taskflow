const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

function getSqliteStorage() {
  const storageValue = process.env.DB_URL?.startsWith('sqlite:')
    ? process.env.DB_URL.replace(/^sqlite:/, '') || './database.sqlite'
    : './database.sqlite';

  if (storageValue === ':memory:') {
    return storageValue;
  }

  const storage = path.resolve(__dirname, '../../', storageValue);
  fs.mkdirSync(path.dirname(storage), { recursive: true });
  return storage;
}

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgresql',
    dialectModule: require('pg'),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: getSqliteStorage(),
    logging: false
  });
}

module.exports = sequelize;
