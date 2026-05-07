export class InscripcionService {
  constructor(inscripcionRepository, paymentLogRepository, userRepository) {
    this.inscripcionRepository = inscripcionRepository;
    this.paymentLogRepository = paymentLogRepository;
    this.userRepository = userRepository;
  }

  async enrollUser(userId, eventoId, metodoPago, monto) {
    const existing = await this.inscripcionRepository.findByUserAndEvent(userId, eventoId);
    if (existing) throw new Error('Ya estás inscrito en este evento');

    const user = await this.userRepository.findById(userId);

    const inscripcionId = await this.inscripcionRepository.create({
      user_id: userId,
      evento_id: eventoId,
      nombre_completo: user.nombre,
      email: user.email,
      telefono: user.telefono,
      direccion: user.direccion,
      metodo_pago: metodoPago || 'Tarjeta',
      monto_pagado: monto || 0
    });

    await this.paymentLogRepository.logPayment({
      inscripcion_id: inscripcionId,
      user_id: userId,
      user_email: user.email,
      evento_id: eventoId,
      metodo_pago: metodoPago || 'Tarjeta',
      monto: monto || 0
    });

    return inscripcionId;
  }
}
