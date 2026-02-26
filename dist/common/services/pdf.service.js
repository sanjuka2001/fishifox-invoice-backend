"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const settings_service_1 = require("../../settings/settings.service");
let PdfService = class PdfService {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async addCompanyHeader(doc, title) {
        const settings = await this.settingsService.getSettings();
        doc.fontSize(24).text(title, { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(settings.companyName, { align: 'left' });
        doc.fontSize(10);
        if (settings.address)
            doc.text(settings.address);
        if (settings.phone)
            doc.text(`Phone: ${settings.phone}`);
        if (settings.email)
            doc.text(`Email: ${settings.email}`);
        if (settings.logoUrl) {
            try {
                doc.image(settings.logoUrl, 50, 45, { width: 50 });
            }
            catch (error) {
                console.error('Failed to load logo image:', error);
            }
        }
        doc.moveDown();
        return settings;
    }
    async generateQuotationPdf(quotation) {
        return new Promise(async (resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            await this.addCompanyHeader(doc, 'QUOTATION');
            doc.fontSize(10);
            doc.text(`Quote Number: ${quotation.quoteNumber}`);
            doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`);
            if (quotation.validUntil) {
                doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`);
            }
            doc.moveDown();
            if (quotation.customer) {
                doc.text(`Customer: ${quotation.customer.companyName}`);
                if (quotation.attentionTo) {
                    doc.text(`Attn: ${quotation.attentionTo}`);
                }
            }
            doc.moveDown();
            doc.font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Unit Price', 350, tableTop);
            doc.text('Total', 450, tableTop);
            doc.moveDown();
            doc.font('Helvetica');
            let y = doc.y;
            const curr = quotation.currency || 'LKR';
            quotation.items?.forEach((item) => {
                doc.text(item.description, 50, y, { width: 240 });
                doc.text(String(item.quantity), 300, y);
                doc.text(`${curr} ${Number(item.unitPrice).toFixed(2)}`, 350, y);
                doc.text(`${curr} ${Number(item.total).toFixed(2)}`, 450, y);
                y += 20;
            });
            doc.moveDown(2);
            doc.y = y + 20;
            const itemsTotal = quotation.items.reduce((sum, item) => sum + Number(item.total), 0);
            let taxAmount = 0;
            if (quotation.taxPercentage > 0) {
                taxAmount = itemsTotal * (Number(quotation.taxPercentage) / 100);
            }
            doc.font('Helvetica-Bold');
            doc.text(`Subtotal: ${curr} ${itemsTotal.toFixed(2)}`, { align: 'right' });
            if (quotation.taxPercentage > 0) {
                doc.text(`Tax (${quotation.taxPercentage}%): ${curr} ${taxAmount.toFixed(2)}`, { align: 'right' });
            }
            doc.text(`Total: ${curr} ${Number(quotation.total).toFixed(2)}`, { align: 'right' });
            if (quotation.notes) {
                doc.moveDown(2);
                doc.font('Helvetica');
                doc.text('Notes:', { underline: true });
                doc.text(quotation.notes);
            }
            doc.end();
        });
    }
    async generateInvoicePdf(invoice) {
        return new Promise(async (resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const settings = await this.addCompanyHeader(doc, 'INVOICE');
            doc.fontSize(10);
            doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
            doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
            if (invoice.dueDate) {
                doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
            }
            doc.text(`Status: ${invoice.status.toUpperCase()}`);
            doc.moveDown();
            if (invoice.customer) {
                doc.text(`Bill To: ${invoice.customer.companyName}`);
            }
            doc.moveDown();
            doc.font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Unit Price', 350, tableTop);
            doc.text('Total', 450, tableTop);
            doc.moveDown();
            doc.font('Helvetica');
            let y = doc.y;
            const curr = invoice.currency || 'LKR';
            invoice.items?.forEach((item) => {
                doc.text(item.description, 50, y, { width: 240 });
                doc.text(String(item.quantity), 300, y);
                doc.text(`${curr} ${Number(item.unitPrice).toFixed(2)}`, 350, y);
                doc.text(`${curr} ${Number(item.total).toFixed(2)}`, 450, y);
                y += 20;
            });
            doc.moveDown(2);
            doc.y = y + 20;
            const subtotal = Number(invoice.total);
            let taxAmount = 0;
            const itemsTotal = invoice.items.reduce((sum, item) => sum + Number(item.total), 0);
            if (invoice.taxPercentage > 0) {
                taxAmount = itemsTotal * (Number(invoice.taxPercentage) / 100);
            }
            doc.font('Helvetica-Bold');
            doc.text(`Subtotal: ${curr} ${itemsTotal.toFixed(2)}`, { align: 'right' });
            if (invoice.taxPercentage > 0) {
                doc.text(`Tax (${invoice.taxPercentage}%): ${curr} ${taxAmount.toFixed(2)}`, { align: 'right' });
                doc.text(`Total: ${curr} ${Number(invoice.total).toFixed(2)}`, { align: 'right' });
            }
            else {
                doc.text(`Total: ${curr} ${Number(invoice.total).toFixed(2)}`, { align: 'right' });
            }
            doc.text(`Amount Paid: ${curr} ${Number(invoice.amountPaid).toFixed(2)}`, { align: 'right' });
            doc.text(`Balance Due: ${curr} ${(Number(invoice.total) - Number(invoice.amountPaid)).toFixed(2)}`, { align: 'right' });
            if (invoice.notes) {
                doc.moveDown(2);
                doc.font('Helvetica');
                doc.text('Notes:', { underline: true });
                doc.text(invoice.notes);
            }
            doc.end();
        });
    }
    async generateCustomerPdf(customer) {
        return new Promise(async (resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            await this.addCompanyHeader(doc, 'CUSTOMER PROFILE');
            doc.fontSize(14).text('Basic Information', { underline: true });
            doc.fontSize(10);
            doc.text(`Company: ${customer.companyName}`);
            doc.text(`Customer ID: ${customer.id}`);
            doc.moveDown();
            doc.fontSize(14).text('Contact Details', { underline: true });
            doc.fontSize(10);
            if (customer.address)
                doc.text(`Address: ${customer.address}`);
            if (customer.contacts && customer.contacts.length > 0) {
                doc.text('Contact Persons:');
                customer.contacts.forEach(c => {
                    const primary = c.isPrimary ? ' (Primary)' : '';
                    doc.text(`  - ${c.name}${primary}`);
                    if (c.phone)
                        doc.text(`      Phone: ${c.phone}`);
                    if (c.email)
                        doc.text(`      Email: ${c.email}`);
                });
            }
            doc.moveDown();
            doc.text(`Member Since: ${new Date(customer.createdAt).toLocaleDateString()}`);
            doc.end();
        });
    }
    async generatePaymentPdf(payment) {
        return new Promise(async (resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            await this.addCompanyHeader(doc, 'PAYMENT RECEIPT');
            doc.fontSize(10);
            doc.text(`Payment ID: ${payment.id}`);
            doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
            if (payment.category) {
                doc.text(`Category: ${payment.category}`);
            }
            doc.moveDown();
            doc.fontSize(12).text('Description', { underline: true });
            doc.fontSize(10);
            doc.text(payment.description);
            doc.moveDown();
            doc.fontSize(14).text(`Amount Paid: LKR ${Number(payment.total || payment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, { align: 'right' });
            if (payment.isRecurring) {
                doc.moveDown();
                doc.fontSize(10).text(`Recurring Payment: ${payment.frequency}`, { align: 'right', oblique: true });
            }
            doc.end();
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map