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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const role_enum_1 = require("../enums/role.enum");
const kyc_status_enum_1 = require("../enums/kyc-status.enum");
const account_status_enum_1 = require("../enums/account-status.enum");
const user_skill_entity_1 = require("./user-skill.entity");
const kyc_document_entity_1 = require("./kyc-document.entity");
let User = class User {
    id;
    firstName;
    lastName;
    email;
    phone;
    passwordHash;
    dateOfBirth;
    role;
    accountStatus;
    bio;
    profilePictureUrl;
    kycStatus;
    averageRating;
    totalReviews;
    completedMissions;
    location;
    defaultAddress;
    stripeAccountId;
    stripeCustomerId;
    referralCode;
    expoPushToken;
    skills;
    kycDocuments;
    createdAt;
    updatedAt;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: role_enum_1.Role,
        default: role_enum_1.Role.CLIENT,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: account_status_enum_1.AccountStatus,
        default: account_status_enum_1.AccountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "accountStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "profilePictureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: kyc_status_enum_1.KycStatus,
        default: kyc_status_enum_1.KycStatus.NOT_SUBMITTED,
    }),
    __metadata("design:type", String)
], User.prototype, "kycStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "totalReviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "completedMissions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'geometry',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    }),
    (0, typeorm_1.Index)({ spatial: true }),
    __metadata("design:type", Object)
], User.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "defaultAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "stripeAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "stripeCustomerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "referralCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "expoPushToken", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_skill_entity_1.UserSkill, (us) => us.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => kyc_document_entity_1.KycDocument, (kyc) => kyc.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "kycDocuments", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map