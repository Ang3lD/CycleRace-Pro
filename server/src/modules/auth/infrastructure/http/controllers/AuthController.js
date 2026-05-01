export class AuthController {
  constructor(authService, userRepository) {
    this.authService = authService;
    this.userRepository = userRepository;
  }

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  register = async (req, res) => {
    try {
      const { nombre, email, password } = req.body;
      if (!nombre || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(409).json({ error: err.message });
    }
  }

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email requerido' });
      const result = await this.authService.forgotPassword(email);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) return res.status(400).json({ error: 'Faltan datos' });
      await this.authService.resetPassword(token, newPassword);
      res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
      res.status(400).json({ error: 'Token inválido' });
    }
  }

  me = async (req, res) => {
    try {
      const user = await this.userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }

  users = async (req, res) => {
    try {
      const users = await this.userRepository.findAll();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Error interno' });
    }
  }
}
