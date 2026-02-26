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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scheduler_service_1 = require("./scheduler.service");
const guards_1 = require("../common/guards");
const decorators_1 = require("../common/decorators");
const user_entity_1 = require("../users/entities/user.entity");
let SchedulerController = class SchedulerController {
    schedulerService;
    constructor(schedulerService) {
        this.schedulerService = schedulerService;
    }
    triggerExpirationCheck() {
        return this.schedulerService.triggerExpirationCheck();
    }
    triggerOverdueCheck() {
        return this.schedulerService.checkOverdueInvoices();
    }
};
exports.SchedulerController = SchedulerController;
__decorate([
    (0, common_1.Post)('trigger-expiration-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger expiration check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "triggerExpirationCheck", null);
__decorate([
    (0, common_1.Post)('trigger-overdue-check'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually trigger overdue invoice check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "triggerOverdueCheck", null);
exports.SchedulerController = SchedulerController = __decorate([
    (0, swagger_1.ApiTags)('scheduler'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, common_1.Controller)('scheduler'),
    __metadata("design:paramtypes", [scheduler_service_1.SchedulerService])
], SchedulerController);
//# sourceMappingURL=scheduler.controller.js.map