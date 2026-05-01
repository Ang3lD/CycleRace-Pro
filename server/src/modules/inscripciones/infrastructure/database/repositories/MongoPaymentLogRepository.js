import { paymentsCol } from '../../../../../config/mongo.js';

export class MongoPaymentLogRepository {
  async logPayment(data) {
    try {
      await paymentsCol.insertOne({
        ...data,
        fecha_pago: new Date(),
        status: 'completed'
      });
    } catch (err) {
      console.error('MongoDB Logging Error:', err);
    }
  }
}
