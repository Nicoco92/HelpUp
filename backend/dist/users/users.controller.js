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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("./enums/role.enum");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getMyProfile(req) {
        return this.usersService.getPublicProfile(req.user.id);
    }
    async updateProfile(req, dto) {
        return this.usersService.updateProfile(req.user.id, dto);
    }
    async getPublicProfile(id) {
        return this.usersService.getPublicProfile(id);
    }
    async updateLocation(req, lat, lng) {
        await this.usersService.updateLocation(req.user.id, lat, lng);
        return { success: true };
    }
    async updatePushToken(req, token) {
        await this.usersService.updatePushToken(req.user.id, token);
        return { success: true };
    }
    async getAllSkills() {
        return this.usersService.getAllSkills();
    }
    async setMySkills(req, skillIds) {
        return this.usersService.setUserSkills(req.user.id, skillIds);
    }
    async submitKyc(req, documentType, documentUrl) {
        return this.usersService.submitKycDocument(req.user.id, documentType, documentUrl);
    }
    async getMyKycDocuments(req) {
        return this.usersService.getUserKycDocuments(req.user.id);
    }
    async reviewKyc(documentId, approved, rejectionReason) {
        return this.usersService.reviewKycDocument(documentId, approved, rejectionReason);
    }
    async generateReferralCode(req) {
        const code = await this.usersService.generateReferralCode(req.user.id);
        return { referralCode: code };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(':id/profile'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPublicProfile", null);
__decorate([
    (0, common_1.Patch)('me/location'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('lat')),
    __param(2, (0, common_1.Body)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Patch)('me/push-token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePushToken", null);
__decorate([
    (0, common_1.Get)('skills'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllSkills", null);
__decorate([
    (0, common_1.Post)('me/skills'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('skillIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "setMySkills", null);
__decorate([
    (0, common_1.Post)('me/kyc'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.PROVIDER, role_enum_1.Role.PREMIUM_PROVIDER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('documentType')),
    __param(2, (0, common_1.Body)('documentUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "submitKyc", null);
__decorate([
    (0, common_1.Get)('me/kyc'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyKycDocuments", null);
__decorate([
    (0, common_1.Patch)('kyc/:documentId/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Body)('approved')),
    __param(2, (0, common_1.Body)('rejectionReason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "reviewKyc", null);
__decorate([
    (0, common_1.Post)('me/referral-code'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "generateReferralCode", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map