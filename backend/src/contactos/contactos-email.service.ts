import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { type Transporter } from 'nodemailer';
import type { MensajeContacto } from './interfaces/mensaje-contacto.interface';

@Injectable()
export class ContactosEmailService {
  private readonly logger = new Logger(ContactosEmailService.name);
  private transporter: Transporter | null | undefined;
  private avisoConfiguracionIncompletaMostrado = false;
  private readonly destinationEmail =
    process.env.CONTACT_DESTINATION_EMAIL?.trim().toLowerCase() || 'de575836@gmail.com';

  async notificarNuevoMensaje(contacto: MensajeContacto) {
    const transporter = this.obtenerTransporter();

    if (!transporter) {
      return {
        delivered: false,
        reason: 'smtp-not-configured',
      };
    }

    try {
      await transporter.sendMail({
        from: this.obtenerRemitente(),
        to: this.destinationEmail,
        replyTo: contacto.email,
        subject: `[Easy Bike] ${contacto.ticket} - ${contacto.asunto}`,
        text: this.construirMensajeTexto(contacto),
        html: this.construirMensajeHtml(contacto),
      });

      return {
        delivered: true,
      };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido al enviar correo.';

      this.logger.error(
        `No se pudo enviar la notificación del contacto ${contacto.ticket} a ${this.destinationEmail}. ${mensaje}`,
      );

      return {
        delivered: false,
        reason: 'smtp-send-failed',
      };
    }
  }

  private obtenerTransporter() {
    if (this.transporter !== undefined) {
      return this.transporter;
    }

    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpPort = Number(process.env.SMTP_PORT?.trim());
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim();
    const mailFromEmail = process.env.MAIL_FROM_EMAIL?.trim();
    const mailFromName = process.env.MAIL_FROM_NAME?.trim();

    if (
      !smtpHost ||
      !Number.isFinite(smtpPort) ||
      !smtpUser ||
      !smtpPass ||
      !mailFromEmail ||
      !mailFromName
    ) {
      if (!this.avisoConfiguracionIncompletaMostrado) {
        this.logger.warn(
          `No se enviarán correos del formulario de contacto porque falta configuración SMTP. El destino previsto sigue siendo ${this.destinationEmail}.`,
        );
        this.avisoConfiguracionIncompletaMostrado = true;
      }

      this.transporter = null;
      return this.transporter;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    return this.transporter;
  }

  private obtenerRemitente() {
    const mailFromName = process.env.MAIL_FROM_NAME?.trim() || 'Easy Bike';
    const mailFromEmail = process.env.MAIL_FROM_EMAIL?.trim() || 'no-reply@easybike.local';

    return `"${mailFromName}" <${mailFromEmail}>`;
  }

  private construirMensajeTexto(contacto: MensajeContacto) {
    return [
      'Nuevo mensaje registrado desde el formulario de contacto de Easy Bike.',
      '',
      `Ticket: ${contacto.ticket}`,
      `Nombre: ${contacto.nombre}`,
      `Correo: ${contacto.email}`,
      `Asunto: ${contacto.asunto}`,
      '',
      'Mensaje:',
      contacto.mensaje,
    ].join('\n');
  }

  private construirMensajeHtml(contacto: MensajeContacto) {
    return `
      <div style="font-family: Arial, sans-serif; color: #132129; line-height: 1.5;">
        <h2 style="margin-bottom: 12px;">Nuevo mensaje de contacto Easy Bike</h2>
        <p><strong>Ticket:</strong> ${this.escaparHtml(contacto.ticket)}</p>
        <p><strong>Nombre:</strong> ${this.escaparHtml(contacto.nombre)}</p>
        <p><strong>Correo:</strong> ${this.escaparHtml(contacto.email)}</p>
        <p><strong>Asunto:</strong> ${this.escaparHtml(contacto.asunto)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${this.escaparHtml(contacto.mensaje).replace(/\n/g, '<br />')}</p>
      </div>
    `;
  }

  private escaparHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
