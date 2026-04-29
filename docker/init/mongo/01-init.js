// ============================================
// Payment Service — MongoDB Init
// ============================================

db = db.getSiblingDB('payment_db');

// Crear colecciones
db.createCollection('pagos');
db.createCollection('comprobantes');

// Índices
db.pagos.createIndex({ user_id: 1 });
db.pagos.createIndex({ inscripcion_id: 1 });
db.pagos.createIndex({ estado: 1 });
db.pagos.createIndex({ created_at: -1 });

db.comprobantes.createIndex({ pago_id: 1 });

// Documento de ejemplo
db.pagos.insertOne({
    user_id: 1,
    inscripcion_id: 1,
    monto: 600.00,
    metodo_pago: "transferencia",
    estado: "validado",
    comprobante_url: "/uploads/comprobante_001.jpg",
    validado_por: "admin@cycleracepro.com",
    created_at: new Date(),
    validated_at: new Date()
});

print("Payment DB inicializada correctamente");
