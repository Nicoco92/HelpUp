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
exports.Mission = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const mission_status_enum_1 = require("../enums/mission-status.enum");
const payment_method_enum_1 = require("../enums/payment-method.enum");
const mission_category_entity_1 = require("./mission-category.entity");
const mission_application_entity_1 = require("./mission-application.entity");
let Mission = class Mission {
    id;
    title;
    description;
    category;
    price;
    paymentMethod;
    client;
    provider;
    status;
    location;
    address;
    scheduledAt;
    estimatedDurationMinutes;
    applications;
    createdAt;
    updatedAt;
};
exports.Mission = Mission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Mission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Mission.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_category_entity_1.MissionCategory, { eager: true }),
    __metadata("design:type", mission_category_entity_1.MissionCategory)
], Mission.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Mission.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: payment_method_enum_1.PaymentMethod,
        default: payment_method_enum_1.PaymentMethod.STRIPE,
    }),
    __metadata("design:type", String)
], Mission.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], Mission.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Mission.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: mission_status_enum_1.MissionStatus,
        default: mission_status_enum_1.MissionStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Mission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    }),
    (0, typeorm_1.Index)({ spatial: true }),
    __metadata("design:type", Object)
], Mission.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Mission.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Mission.prototype, "scheduledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Mission.prototype, "estimatedDurationMinutes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => mission_application_entity_1.MissionApplication, (a) => a.mission, { cascade: true }),
    __metadata("design:type", Array)
], Mission.prototype, "applications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Mission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Mission.prototype, "updatedAt", void 0);
exports.Mission = Mission = __decorate([
    (0, typeorm_1.Entity)('missions')
], Mission);
//# sourceMappingURL=mission.entity.js.map