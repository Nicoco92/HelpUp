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
exports.MissionApplication = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const mission_entity_1 = require("./mission.entity");
const application_status_enum_1 = require("../enums/application-status.enum");
let MissionApplication = class MissionApplication {
    id;
    mission;
    provider;
    status;
    coverMessage;
    createdAt;
};
exports.MissionApplication = MissionApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MissionApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission, (m) => m.applications, { onDelete: 'CASCADE' }),
    __metadata("design:type", mission_entity_1.Mission)
], MissionApplication.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], MissionApplication.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: application_status_enum_1.ApplicationStatus,
        default: application_status_enum_1.ApplicationStatus.PENDING,
    }),
    __metadata("design:type", String)
], MissionApplication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MissionApplication.prototype, "coverMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MissionApplication.prototype, "createdAt", void 0);
exports.MissionApplication = MissionApplication = __decorate([
    (0, typeorm_1.Entity)('mission_applications')
], MissionApplication);
//# sourceMappingURL=mission-application.entity.js.map