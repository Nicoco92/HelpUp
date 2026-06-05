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
exports.KycDocument = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
let KycDocument = class KycDocument {
    id;
    user;
    documentType;
    documentUrl;
    status;
    rejectionReason;
    createdAt;
    updatedAt;
};
exports.KycDocument = KycDocument;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], KycDocument.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (u) => u.kycDocuments, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], KycDocument.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KycDocument.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], KycDocument.prototype, "documentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: kyc_status_enum_1.KycStatus,
        default: kyc_status_enum_1.KycStatus.PENDING,
    }),
    __metadata("design:type", String)
], KycDocument.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], KycDocument.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], KycDocument.prototype, "updatedAt", void 0);
exports.KycDocument = KycDocument = __decorate([
    (0, typeorm_1.Entity)('kyc_documents')
], KycDocument);
//# sourceMappingURL=kyc-document.entity.js.map