import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DURACION_REFRESH_TOKEN_MS,
  NOMBRE_COOKIE_REFRESH,
} from './autenticacion.constantes';
import { AutenticacionService } from './autenticacion.service';
import { UsuarioActual } from './decoradores/usuario-actual.decorator';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import type { Request, Response } from 'express';
import type { UsuarioAutenticado } from './interfaces/usuario-autenticado.interface';
import { esProduccion, normalizarOrigenHttp } from '../comun/utilidades/entorno.util';

@Controller('auth')
export class AutenticacionController {
  constructor(
    private readonly autenticacionService: AutenticacionService,
    private readonly configService: ConfigService,
  ) {}

  @Post('registro')
  async registro(@Body() dto: RegistroDto, @Res({ passthrough: true }) response: Response) {
    const resultado = await this.autenticacionService.registrar(dto);
    this.establecerCookieRefresh(response, resultado.refreshToken);

    return {
      success: resultado.success,
      accessToken: resultado.accessToken,
      session: resultado.session,
      message: resultado.message,
    };
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const resultado = await this.autenticacionService.login(dto);
    this.establecerCookieRefresh(response, resultado.refreshToken);

    return {
      success: resultado.success,
      accessToken: resultado.accessToken,
      session: resultado.session,
      message: resultado.message,
    };
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.extraerRefreshToken(request);
    const resultado = await this.autenticacionService.renovar(refreshToken);
    this.establecerCookieRefresh(response, resultado.refreshToken);

    return {
      success: resultado.success,
      accessToken: resultado.accessToken,
      session: resultado.session,
      message: resultado.message,
    };
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = this.extraerRefreshToken(request, false);
    const resultado = await this.autenticacionService.logout(refreshToken);
    this.limpiarCookieRefresh(response);

    return resultado;
  }

  @UseGuards(JwtAccessGuard)
  @Get('perfil')
  obtenerPerfil(@UsuarioActual() usuarioActual: UsuarioAutenticado) {
    return this.autenticacionService.obtenerPerfil(usuarioActual);
  }

  private extraerRefreshToken(request: Request, requerido = true) {
    const cookies = this.parsearCookies(request.headers.cookie);
    const refreshToken = cookies[NOMBRE_COOKIE_REFRESH];

    if (!refreshToken && requerido) {
      throw new UnauthorizedException('No se encontró una cookie de sesión para renovar acceso.');
    }

    return refreshToken;
  }

  private establecerCookieRefresh(response: Response, refreshToken: string) {
    response.cookie(NOMBRE_COOKIE_REFRESH, refreshToken, this.obtenerOpcionesCookie());
  }

  private limpiarCookieRefresh(response: Response) {
    response.clearCookie(NOMBRE_COOKIE_REFRESH, this.obtenerOpcionesCookie());
  }

  private obtenerOpcionesCookie() {
    const frontendUrl = normalizarOrigenHttp(
      'FRONTEND_URL',
      this.configService.get<string>('FRONTEND_URL'),
    );
    const origenSeguro = frontendUrl?.startsWith('https://') ?? false;
    const secure = esProduccion() || origenSeguro;
    const sameSite = esProduccion() ? 'none' : secure ? 'none' : 'lax';

    return {
      httpOnly: true,
      secure,
      sameSite: sameSite as 'none' | 'lax',
      path: '/',
      maxAge: DURACION_REFRESH_TOKEN_MS,
    };
  }

  private parsearCookies(cookieHeader?: string) {
    return (cookieHeader ?? '')
      .split(';')
      .map((segmento) => segmento.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acumulado, segmento) => {
        const separador = segmento.indexOf('=');

        if (separador === -1) {
          return acumulado;
        }

        const nombre = segmento.slice(0, separador).trim();
        const valor = segmento.slice(separador + 1).trim();

        acumulado[nombre] = decodeURIComponent(valor);
        return acumulado;
      }, {});
  }
}
