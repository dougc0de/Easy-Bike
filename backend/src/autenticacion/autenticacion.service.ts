import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { REPOSITORIO_USUARIOS } from '../comun/constantes/tokens-repositorios';
import { RolUsuario } from '../comun/enums/rol-usuario.enum';
import { obtenerMarcaTiempoActual } from '../comun/utilidades/fechas.util';
import { compararHashSeguro, generarHashSeguro } from '../comun/utilidades/seguridad.util';
import {
  ActualizarUsuarioPersistencia,
  CrearUsuarioPersistencia,
  Usuario,
} from '../usuarios/interfaces/usuario.interface';
import type { RepositorioUsuarios } from '../usuarios/repositorios/usuarios.repositorio';
import {
  DURACION_ACCESS_TOKEN,
  DURACION_REFRESH_TOKEN,
  LONGITUD_MINIMA_PASSWORD,
} from './autenticacion.constantes';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SesionAutenticada } from './interfaces/sesion-autenticada.interface';
import { UsuarioAutenticado } from './interfaces/usuario-autenticado.interface';

@Injectable()
export class AutenticacionService {
  constructor(
    @Inject(REPOSITORIO_USUARIOS)
    private readonly repositorioUsuarios: RepositorioUsuarios,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registrar(dto: RegistroDto) {
    const email = dto.email.trim().toLowerCase();
    const nombreCompleto = dto.nombreCompleto.trim();
    const telefono = dto.telefono?.trim() || null;
    const password = dto.password.trim();
    const confirmPassword = dto.confirmPassword.trim();

    if (password !== confirmPassword) {
      throw new BadRequestException('La confirmación de contraseña no coincide.');
    }

    this.validarFortalezaPassword(password);

    const existente = await this.repositorioUsuarios.obtenerPorEmail(email);

    if (existente) {
      throw new ConflictException('Ese correo ya está registrado. Inicia sesión o usa otro correo.');
    }

    const marcaTiempo = obtenerMarcaTiempoActual();
    const passwordHash = await generarHashSeguro(password);
    const datosUsuario: CrearUsuarioPersistencia = {
      email,
      nombreCompleto,
      rol: RolUsuario.CLIENTE,
      telefono,
      passwordHash,
      activo: true,
      ultimoAccesoAt: marcaTiempo,
    };

    const usuario = await this.repositorioUsuarios.crear(datosUsuario);
    const tokens = await this.generarTokens(usuario);
    await this.persistirRefreshToken(usuario.id, tokens.refreshToken, marcaTiempo);

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      session: this.construirSesion(usuario, marcaTiempo),
      message: 'Tu cuenta fue creada correctamente y ya puedes entrar a tu perfil de cliente.',
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const password = dto.password.trim();
    const usuario = await this.repositorioUsuarios.obtenerPorEmail(email);

    if (!usuario?.passwordHash) {
      throw new UnauthorizedException(
        'Credenciales inválidas. Revisa tu correo y contraseña para continuar.',
      );
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta se encuentra inactiva. Contacta a Easy Bike.');
    }

    const passwordValido = await compararHashSeguro(password, usuario.passwordHash);

    if (!passwordValido) {
      throw new UnauthorizedException(
        'Credenciales inválidas. Revisa tu correo y contraseña para continuar.',
      );
    }

    const marcaTiempo = obtenerMarcaTiempoActual();
    const tokens = await this.generarTokens(usuario);
    await this.persistirRefreshToken(usuario.id, tokens.refreshToken, marcaTiempo);

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      session: this.construirSesion(usuario, marcaTiempo),
      message:
        usuario.rol === RolUsuario.ADMINISTRACION
          ? 'Bienvenido al panel administrativo de Easy Bike.'
          : 'Bienvenido a tu perfil de reservas Easy Bike.',
    };
  }

  async renovar(refreshToken: string) {
    const payload = await this.verificarRefreshToken(refreshToken);
    const usuario = await this.obtenerUsuarioActivoPorId(payload.sub);

    if (!usuario.refreshTokenHash) {
      throw new UnauthorizedException('No existe una sesión activa para renovar.');
    }

    const tokenValido = await compararHashSeguro(refreshToken, usuario.refreshTokenHash);

    if (!tokenValido) {
      throw new UnauthorizedException('La sesión de renovación ya no es válida.');
    }

    const marcaTiempo = obtenerMarcaTiempoActual();
    const tokens = await this.generarTokens(usuario);
    await this.persistirRefreshToken(usuario.id, tokens.refreshToken, marcaTiempo);

    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      session: this.construirSesion(usuario, marcaTiempo),
      message: 'Tu sesión fue renovada correctamente.',
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return {
        success: true,
        message: 'Sesión cerrada en este dispositivo.',
      };
    }

    try {
      const payload = await this.verificarRefreshToken(refreshToken);
      const usuario = await this.repositorioUsuarios.obtenerPorId(payload.sub);

      if (usuario) {
        const cambios: ActualizarUsuarioPersistencia = {
          refreshTokenHash: null,
        };

        await this.repositorioUsuarios.actualizar(usuario.id, cambios);
      }
    } catch {
      // Si el refresh token es inválido igual limpiamos la cookie y cerramos en frontend.
    }

    return {
      success: true,
      message: 'Sesión cerrada en este dispositivo.',
    };
  }

  async obtenerPerfil(usuarioActual: UsuarioAutenticado) {
    const usuario = await this.obtenerUsuarioActivoPorId(usuarioActual.userId);

    return {
      success: true,
      session: this.construirSesion(usuario, obtenerMarcaTiempoActual()),
    };
  }

  private construirSesion(usuario: Usuario, marcaTiempo: string): SesionAutenticada {
    return {
      email: usuario.email,
      role: usuario.rol,
      loggedAt: marcaTiempo,
      name: usuario.nombreCompleto,
    };
  }

  private validarFortalezaPassword(password: string) {
    if (password.length < LONGITUD_MINIMA_PASSWORD) {
      throw new BadRequestException(
        `La contraseña debe tener al menos ${LONGITUD_MINIMA_PASSWORD} caracteres.`,
      );
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      throw new BadRequestException(
        'La contraseña debe incluir mayúscula, minúscula y al menos un número.',
      );
    }
  }

  private async generarTokens(usuario: Usuario) {
    const accessSecret = this.obtenerJwtSecret('JWT_SECRET');
    const refreshSecret = this.obtenerJwtSecret('JWT_REFRESH_SECRET');
    const payloadBase = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.rol,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          ...payloadBase,
          type: 'access',
        } satisfies JwtPayload,
        {
          secret: accessSecret,
          expiresIn: DURACION_ACCESS_TOKEN,
        },
      ),
      this.jwtService.signAsync(
        {
          ...payloadBase,
          type: 'refresh',
        } satisfies JwtPayload,
        {
          secret: refreshSecret,
          expiresIn: DURACION_REFRESH_TOKEN,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async persistirRefreshToken(usuarioId: string, refreshToken: string, marcaTiempo: string) {
    const refreshTokenHash = await generarHashSeguro(refreshToken);
    const cambios: ActualizarUsuarioPersistencia = {
      refreshTokenHash,
      ultimoAccesoAt: marcaTiempo,
      updatedAt: marcaTiempo,
    };

    await this.repositorioUsuarios.actualizar(usuarioId, cambios);
  }

  private async verificarRefreshToken(refreshToken: string) {
    const refreshSecret = this.obtenerJwtSecret('JWT_REFRESH_SECRET');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('El token recibido no corresponde a una sesión renovable.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('El refresh token es inválido o expiró.');
    }
  }

  private async obtenerUsuarioActivoPorId(id: string) {
    const usuario = await this.repositorioUsuarios.obtenerPorId(id);

    if (!usuario) {
      throw new UnauthorizedException('No se encontró el usuario autenticado.');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Tu cuenta se encuentra inactiva. Contacta a Easy Bike.');
    }

    return usuario;
  }

  private obtenerJwtSecret(clave: 'JWT_SECRET' | 'JWT_REFRESH_SECRET') {
    const secreto = this.configService.get<string>(clave)?.trim();

    if (!secreto) {
      throw new UnauthorizedException(`${clave} no está configurado en el backend.`);
    }

    return secreto;
  }
}
