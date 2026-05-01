import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env.js';

export class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async login(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.activo) throw new Error('Credenciales inválidas');

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) throw new Error('Credenciales inválidas');

    return this.generateTokenResponse(user);
  }

  async register(userData) {
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) throw new Error('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.userRepository.create({
      ...userData,
      password_hash: hashedPassword
    });

    return this.generateTokenResponse(newUser);
  }

  async forgotPassword(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return { message: 'Si el email existe, se enviará un enlace de recuperación.' };

    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, env.JWT_SECRET, { expiresIn: '30m' });
    return {
      message: 'Si el email existe, se enviará un enlace de recuperación.',
      _demo_token: resetToken,
    };
  }

  async resetPassword(token, newPassword) {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.type !== 'reset') throw new Error('Token inválido');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(decoded.id, hashed);
  }

  generateTokenResponse(user) {
    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES }
    );
    return {
      token,
      user: {
        id: user.id, email: user.email, nombre: user.nombre,
        telefono: user.telefono, direccion: user.direccion, rol: user.rol
      }
    };
  }
}
