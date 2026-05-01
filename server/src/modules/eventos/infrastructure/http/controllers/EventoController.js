export class EventoController {
  constructor(eventoRepository) {
    this.eventoRepository = eventoRepository;
  }

  getAll = async (req, res) => {
    try {
      const eventos = await this.eventoRepository.findAll();
      res.json(eventos);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  getById = async (req, res) => {
    try {
      const evento = await this.eventoRepository.findById(req.params.id);
      if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
      res.json(evento);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  create = async (req, res) => {
    try {
      const { nombre, descripcion, fecha_evento } = req.body;
      if (!nombre || !descripcion || !fecha_evento) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
      }
      const id = await this.eventoRepository.create(req.body);
      res.status(201).json({ id, message: 'Evento creado exitosamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
