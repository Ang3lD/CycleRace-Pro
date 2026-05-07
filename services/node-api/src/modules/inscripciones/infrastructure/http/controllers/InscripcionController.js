export class InscripcionController {
  constructor(inscripcionService, inscripcionRepository) {
    this.inscripcionService = inscripcionService;
    this.inscripcionRepository = inscripcionRepository;
  }

  create = async (req, res) => {
    try {
      const { evento_id, metodo_pago, monto } = req.body;
      if (!evento_id) return res.status(400).json({ error: 'evento_id es requerido' });
      
      const id = await this.inscripcionService.enrollUser(req.user.id, evento_id, metodo_pago, monto);
      res.status(201).json({ id, message: 'Pago e inscripción exitosa' });
    } catch (err) {
      res.status(err.message === 'Ya estás inscrito en este evento' ? 409 : 500).json({ error: err.message });
    }
  }

  getMyInscriptions = async (req, res) => {
    try {
      const rows = await this.inscripcionRepository.findByUserId(req.user.id);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  getAll = async (req, res) => {
    try {
      const rows = await this.inscripcionRepository.findAll();
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  validate = async (req, res) => {
    try {
      const nextNum = await this.inscripcionRepository.getNextCompetitorNumber();
      await this.inscripcionRepository.validateStatus(req.params.id, nextNum);
      res.json({ message: 'Inscripción validada', numero_competidor: nextNum });
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  reject = async (req, res) => {
    try {
      await this.inscripcionRepository.rejectStatus(req.params.id);
      res.json({ message: 'Inscripción rechazada' });
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }
}
