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
exports.MissionsController = void 0;
const common_1 = require("@nestjs/common");
const missions_service_1 = require("./missions.service");
const create_mission_dto_1 = require("./dto/create-mission.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_enum_1 = require("../users/enums/role.enum");
const mission_status_enum_1 = require("./enums/mission-status.enum");
let MissionsController = class MissionsController {
    missionsService;
    constructor(missionsService) {
        this.missionsService = missionsService;
    }
    async getCategories() {
        return this.missionsService.findAllCategories();
    }
    async create(createMissionDto, req) {
        return this.missionsService.create(createMissionDto, req.user);
    }
    async findAll(status) {
        return this.missionsService.findAll(status);
    }
    async findPublished() {
        return this.missionsService.findPublished();
    }
    async findMyMissions(req) {
        return this.missionsService.findByClient(req.user.id);
    }
    async findNearby(lat, lng, radius) {
        return this.missionsService.findNearby(Number(lat), Number(lng), Number(radius) || 10);
    }
    async findById(id) {
        return this.missionsService.findById(id);
    }
    async publish(id, req) {
        return this.missionsService.transitionStatus(id, mission_status_enum_1.MissionStatus.PUBLISHED, req.user.id);
    }
    async start(id, req) {
        return this.missionsService.transitionStatus(id, mission_status_enum_1.MissionStatus.IN_PROGRESS, req.user.id);
    }
    async complete(id, req) {
        return this.missionsService.transitionStatus(id, mission_status_enum_1.MissionStatus.COMPLETED, req.user.id);
    }
    async cancel(id, req) {
        return this.missionsService.transitionStatus(id, mission_status_enum_1.MissionStatus.CANCELLED, req.user.id);
    }
    async apply(id, coverMessage, req) {
        return this.missionsService.apply(id, req.user, coverMessage);
    }
    async getApplications(id) {
        return this.missionsService.getApplications(id);
    }
    async acceptApplication(id, appId, req) {
        return this.missionsService.acceptApplication(id, appId, req.user);
    }
};
exports.MissionsController = MissionsController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CLIENT),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_mission_dto_1.CreateMissionDto, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('published'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "findPublished", null);
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "findMyMissions", null);
__decorate([
    (0, common_1.Get)('nearby'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.PROVIDER, role_enum_1.Role.PREMIUM_PROVIDER),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "findNearby", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id/publish'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CLIENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "publish", null);
__decorate([
    (0, common_1.Patch)(':id/start'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.PROVIDER, role_enum_1.Role.PREMIUM_PROVIDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "start", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.PROVIDER, role_enum_1.Role.PREMIUM_PROVIDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CLIENT, role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Post)(':id/apply'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.PROVIDER, role_enum_1.Role.PREMIUM_PROVIDER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('coverMessage')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)(':id/applications'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CLIENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "getApplications", null);
__decorate([
    (0, common_1.Post)(':id/applications/:appId/accept'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.CLIENT),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('appId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "acceptApplication", null);
exports.MissionsController = MissionsController = __decorate([
    (0, common_1.Controller)('missions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [missions_service_1.MissionsService])
], MissionsController);
//# sourceMappingURL=missions.controller.js.map