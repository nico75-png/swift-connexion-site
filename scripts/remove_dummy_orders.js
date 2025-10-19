import 'dotenv/config';
import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required.');
  process.exit(1);
}

const deleteDummyOrders = async () => {
  const client = new Client({ connectionString });

  try {
    await client.connect();

    const deleteQuery = `
      DELETE FROM orders
      WHERE order_number LIKE $1
    `;

    const pattern = 'ORD-0%';

    const result = await client.query(deleteQuery, [pattern]);

    console.log(`Deleted ${result.rowCount} dummy order(s) matching pattern ${pattern}.`);
  } catch (error) {
    console.error('Failed to delete dummy orders:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

deleteDummyOrders();
