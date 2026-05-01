import { MongoClient } from 'mongodb';
import { env } from './env.js';

export const mongoClient = new MongoClient(env.MONGO_URL);
export let paymentsCol;

export async function initMongo() {
  await mongoClient.connect();
  const db = mongoClient.db('payments_db');
  paymentsCol = db.collection('payment_logs');
}
