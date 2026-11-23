import pg from 'pg';
import {dbConfig} from './db.config';

export async function cleanupDb(): Promise<void> {
    const client = new pg.Client(dbConfig);

    try {
        await client.connect();
        await client.query('TRUNCATE TABLE order_items, orders RESTART IDENTITY');
    } finally {
        await client.end();
    }
}
