// ============================================
// Reports Service — MongoDB Init
// ============================================

db = db.getSiblingDB('reports_db');

// Colecciones para reportes
db.createCollection('registros_diarios');
db.createCollection('ingresos');
db.createCollection('estadisticas_categoria');

// Índices
db.registros_diarios.createIndex({ fecha: -1 });
db.registros_diarios.createIndex({ carrera_id: 1 });
db.ingresos.createIndex({ fecha: -1 });
db.estadisticas_categoria.createIndex({ categoria: 1 });

// Datos de ejemplo
db.registros_diarios.insertMany([
    { fecha: new Date("2026-04-20"), total_registros: 18, carrera_id: 1 },
    { fecha: new Date("2026-04-21"), total_registros: 24, carrera_id: 1 },
    { fecha: new Date("2026-04-22"), total_registros: 31, carrera_id: 1 },
    { fecha: new Date("2026-04-23"), total_registros: 22, carrera_id: 1 },
    { fecha: new Date("2026-04-24"), total_registros: 45, carrera_id: 1 },
    { fecha: new Date("2026-04-25"), total_registros: 58, carrera_id: 1 },
    { fecha: new Date("2026-04-26"), total_registros: 49, carrera_id: 1 }
]);

db.estadisticas_categoria.insertMany([
    { categoria: "100km Élite", total: 89, porcentaje: 36 },
    { categoria: "Damas", total: 62, porcentaje: 25 },
    { categoria: "Sub-23", total: 45, porcentaje: 18 },
    { categoria: "Infantil", total: 31, porcentaje: 13 },
    { categoria: "Master/Veteranos", total: 20, porcentaje: 8 }
]);

print("Reports DB inicializada correctamente");
