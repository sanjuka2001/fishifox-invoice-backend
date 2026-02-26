import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { SettingsService } from '../../settings/settings.service';

@Injectable()
export class PdfService {
    constructor(private readonly settingsService: SettingsService) { }

    private async addCompanyHeader(doc: any, title: string) {
        const settings = await this.settingsService.getSettings();

        // Header
        doc.fontSize(24).text(title, { align: 'center' });
        doc.moveDown();

        // Company Details
        doc.fontSize(12).text(settings.companyName, { align: 'left' });
        doc.fontSize(10);
        if (settings.address) doc.text(settings.address);
        if (settings.phone) doc.text(`Phone: ${settings.phone}`);
        if (settings.email) doc.text(`Email: ${settings.email}`);

        // Add Logo if exists
        if (settings.logoUrl) {
            try {
                // Assuming logoUrl is a relative path like 'uploads/logos/...'
                // which pdfkit can resolve relative to cwd or we provide absolute path
                doc.image(settings.logoUrl, 50, 45, { width: 50 });
            } catch (error) {
                console.error('Failed to load logo image:', error);
            }
        }

        doc.moveDown();

        return settings;
    }

    async generateQuotationPdf(quotation: Quotation): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            await this.addCompanyHeader(doc, 'QUOTATION');

            // Quotation Details
            doc.fontSize(10);
            doc.text(`Quote Number: ${quotation.quoteNumber}`);
            doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`);
            if (quotation.validUntil) {
                doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`);
            }
            doc.moveDown();

            // Customer Info
            if (quotation.customer) {
                doc.text(`Customer: ${quotation.customer.companyName}`);
                if (quotation.attentionTo) {
                    doc.text(`Attn: ${quotation.attentionTo}`);
                }
            }
            doc.moveDown();

            // Items Table Header
            doc.font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Unit Price', 350, tableTop);
            doc.text('Total', 450, tableTop);
            doc.moveDown();

            // Items
            doc.font('Helvetica');
            let y = doc.y;
            const curr = (quotation as any).currency || 'LKR';
            quotation.items?.forEach((item) => {
                doc.text(item.description, 50, y, { width: 240 });
                doc.text(String(item.quantity), 300, y);
                doc.text(`${curr} ${Number(item.unitPrice).toFixed(2)}`, 350, y);
                doc.text(`${curr} ${Number(item.total).toFixed(2)}`, 450, y);
                y += 20;
            });

            doc.moveDown(2);
            doc.y = y + 20;

            // Total
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

            // Notes
            if (quotation.notes) {
                doc.moveDown(2);
                doc.font('Helvetica');
                doc.text('Notes:', { underline: true });
                doc.text(quotation.notes);
            }

            doc.end();
        });
    }

    async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const settings = await this.addCompanyHeader(doc, 'INVOICE');

            // Invoice Details
            doc.fontSize(10);
            doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
            doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
            if (invoice.dueDate) {
                doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);
            }
            doc.text(`Status: ${invoice.status.toUpperCase()}`);
            doc.moveDown();

            // Customer Info
            if (invoice.customer) {
                doc.text(`Bill To: ${invoice.customer.companyName}`);
            }
            doc.moveDown();

            // Items Table Header
            doc.font('Helvetica-Bold');
            const tableTop = doc.y;
            doc.text('Description', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Unit Price', 350, tableTop);
            doc.text('Total', 450, tableTop);
            doc.moveDown();

            // Items
            doc.font('Helvetica');
            let y = doc.y;
            const curr = (invoice as any).currency || 'LKR';
            invoice.items?.forEach((item) => {
                doc.text(item.description, 50, y, { width: 240 });
                doc.text(String(item.quantity), 300, y);
                doc.text(`${curr} ${Number(item.unitPrice).toFixed(2)}`, 350, y);
                doc.text(`${curr} ${Number(item.total).toFixed(2)}`, 450, y);
                y += 20;
            });

            doc.moveDown(2);
            doc.y = y + 20;

            // Totals
            const subtotal = Number(invoice.total);
            let taxAmount = 0;
            // Total is stored in invoice.total, but strictly speaking total = sub + tax.
            // If stored total already includes tax, we need to back-calculate for display or trust stored total.
            // Stored total INCLUDES tax.
            // But here we're recalculating from subtotal? Wait. 
            // The Invoice entity stores 'total' which INCLUDES tax.
            // And 'total' in items line is quantity * unitPrice.
            // So Invoice Total should be sum(items.total) + tax.
            // Let's verify how we saved it. 
            // create: subtotal = items.reduce... total = subtotal + tax.
            // So invoice.total IS the grand total.

            const itemsTotal = invoice.items.reduce((sum, item) => sum + Number(item.total), 0);

            if (invoice.taxPercentage > 0) {
                taxAmount = itemsTotal * (Number(invoice.taxPercentage) / 100);
            }

            doc.font('Helvetica-Bold');
            doc.text(`Subtotal: ${curr} ${itemsTotal.toFixed(2)}`, { align: 'right' });

            if (invoice.taxPercentage > 0) {
                doc.text(`Tax (${invoice.taxPercentage}%): ${curr} ${taxAmount.toFixed(2)}`, { align: 'right' });
                doc.text(`Total: ${curr} ${Number(invoice.total).toFixed(2)}`, { align: 'right' });
            } else {
                doc.text(`Total: ${curr} ${Number(invoice.total).toFixed(2)}`, { align: 'right' });
            }

            doc.text(`Amount Paid: ${curr} ${Number(invoice.amountPaid).toFixed(2)}`, { align: 'right' });
            doc.text(`Balance Due: ${curr} ${(Number(invoice.total) - Number(invoice.amountPaid)).toFixed(2)}`, { align: 'right' });

            // Notes
            if (invoice.notes) {
                doc.moveDown(2);
                doc.font('Helvetica');
                doc.text('Notes:', { underline: true });
                doc.text(invoice.notes);
            }

            doc.end();
        });
    }

    async generateCustomerPdf(customer: Customer): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
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
            if (customer.address) doc.text(`Address: ${customer.address}`);

            if (customer.contacts && customer.contacts.length > 0) {
                doc.text('Contact Persons:');
                customer.contacts.forEach(c => {
                    const primary = c.isPrimary ? ' (Primary)' : '';
                    doc.text(`  - ${c.name}${primary}`);
                    if (c.phone) doc.text(`      Phone: ${c.phone}`);
                    if (c.email) doc.text(`      Email: ${c.email}`);
                });
            }
            doc.moveDown();

            doc.text(`Member Since: ${new Date(customer.createdAt).toLocaleDateString()}`);

            doc.end();
        });
    }

    async generatePaymentPdf(payment: any): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk: any) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            await this.addCompanyHeader(doc, 'PAYMENT RECEIPT');

            // Payment Details
            doc.fontSize(10);
            doc.text(`Payment ID: ${payment.id}`);
            doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString()}`);
            if (payment.category) {
                doc.text(`Category: ${payment.category}`);
            }
            doc.moveDown();

            // Description
            doc.fontSize(12).text('Description', { underline: true });
            doc.fontSize(10);
            doc.text(payment.description);
            doc.moveDown();

            // Amount
            doc.fontSize(14).text(`Amount Paid: LKR ${Number(payment.total || payment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, { align: 'right' });

            if (payment.isRecurring) {
                doc.moveDown();
                doc.fontSize(10).text(`Recurring Payment: ${payment.frequency}`, { align: 'right', oblique: true });
            }

            doc.end();
        });
    }
}
