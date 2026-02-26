import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME || 'postgres',
        password: 'postgre123', // Force using the working password if env is not updated yet
        database: 'postgres', // Connect to default DB
    });

    try {
        await client.connect();
        console.log('Connected to postgres database.');

        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_DATABASE || 'fishifox'}'`);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${process.env.DB_DATABASE || 'fishifox'}"`);
            console.log(`Database ${process.env.DB_DATABASE || 'fishifox'} created successfully.`);
        } else {
            console.log(`Database ${process.env.DB_DATABASE || 'fishifox'} already exists.`);
        }
    } catch (err) {
        console.error('Error creating database:', err);
    } finally {
        await client.end();
    }
}

createDatabase();
