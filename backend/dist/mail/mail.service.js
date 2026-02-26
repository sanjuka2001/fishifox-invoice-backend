"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = class MailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: false,
            requireTLS: true,
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendMail(to, subject, html, attachments) {
        try {
            const info = await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM'),
                to,
                subject,
                html,
                attachments,
            });
            console.log('Email sent successfully:', info.messageId);
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw error;
        }
    }
    async sendQuotationEmail(to, customerName, quoteNumber, pdfBuffer) {
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
    async sendInvoiceEmail(to, customerName, invoiceNumber, pdfBuffer) {
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
    async sendExpirationReminder(to, customerName, serviceName, expiryDate, projectName) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map