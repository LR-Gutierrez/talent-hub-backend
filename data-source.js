const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const { join } = require('path');

config({ path: join(__dirname, '.env') });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'talent_hub',
  entities: [join(__dirname, 'dist', '**', '*.entity.js')],
  migrations: [join(__dirname, 'dist', 'migrations', '*.js')],
  synchronize: false,
});

module.exports = dataSource;
