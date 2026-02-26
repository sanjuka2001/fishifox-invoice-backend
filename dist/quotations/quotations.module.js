"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuotationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quotations_service_1 = require("./quotations.service");
const quotations_controller_1 = require("./quotations.controller");
const quotation_entity_1 = require("./entities/quotation.entity");
const quotation_item_entity_1 = require("./entities/quotation-item.entity");
const invoice_entity_1 = require("../invoices/entities/invoice.entity");
const customers_module_1 = require("../customers/customers.module");
const common_module_1 = require("../common/common.module");
const settings_module_1 = require("../settings/settings.module");
const invoices_module_1 = require("../invoices/invoices.module");
let QuotationsModule = class QuotationsModule {
};
exports.QuotationsModule = QuotationsModule;
exports.QuotationsModule = QuotationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([quotation_entity_1.Quotation, quotation_item_entity_1.QuotationItem, invoice_entity_1.Invoice]),
            customers_module_1.CustomersModule,
            (0, common_1.forwardRef)(() => invoices_module_1.InvoicesModule),
            common_module_1.CommonModule,
            settings_module_1.SettingsModule,
        ],
        controllers: [quotations_controller_1.QuotationsController],
        providers: [quotations_service_1.QuotationsService],
        exports: [quotations_service_1.QuotationsService],
    })
], QuotationsModule);
//# sourceMappingURL=quotations.module.js.map