import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: false, // true for 465, false for other ports
            requireTLS: true, // Required for Gmail port 587
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendMail(to: string, subject: string, html: string, attachments?: any[]): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: this.configService.get<string>('SMTP_FROM'),
                to,
                subject,
                html,
                attachments,
            });
            console.log('Email sent successfully:', info.messageId);
        } catch (error) {
            console.error('Failed to send email:', error);
            throw error; // Re-throw so the controller can handle it
        }
    }

    async sendQuotationEmail(to: string, customerName: string, quoteNumber: string, pdfBuffer: Buffer): Promise<void> {
        const html = `
      <h2>Quotation from Fishifox</h2>
      <p>Dear ${customerName},</p>
      <p>Please find attached your quotation <strong>${quoteNumber}</strong>.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <br>
      <p>Best regards,<br>Fishifox Team</p>
    `;

        await this.sendMail(to, `Quotation ${quoteNumber} - Fishifox`, html, [
            {
                filename: `quotation-${quoteNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ]);
    }

    async sendInvoiceEmail(to: string, customerName: string, invoiceNumber: string, pdfBuffer: Buffer): Promise<void> {
        const html = `
      <h2>Invoice from Fishifox</h2>
      <p>Dear ${customerName},</p>
      <p>Please find attached your invoice <strong>${invoiceNumber}</strong>.</p>
      <p>If you have any questions regarding this invoice, please contact us.</p>
      <br>
      <p>Best regards,<br>Fishifox Team</p>
    `;

        await this.sendMail(to, `Invoice ${invoiceNumber} - Fishifox`, html, [
            {
                filename: `invoice-${invoiceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ]);
    }

    async sendExpirationReminder(
        to: string,
        customerName: string,
        serviceName: string,
        expiryDate: Date,
        projectName: string,
    ): Promise<void> {
        const formattedDate = expiryDate.toLocaleDateString();
        const html = `
      <h2>Service Expiration Reminder</h2>
      <p>Dear ${customerName},</p>
      <p>This is a reminder that the following service is expiring soon:</p>
      <ul>
        <li><strong>Service:</strong> ${serviceName}</li>
        <li><strong>Project:</strong> ${projectName}</li>
        <li><strong>Expiry Date:</strong> ${formattedDate}</li>
      </ul>
      <p>Please contact us to renew this service before the expiration date.</p>
      <br>
      <p>Best regards,<br>Fishifox Team</p>
    `;

        await this.sendMail(to, `Service Expiration Reminder: ${serviceName}`, html);
    }
}
