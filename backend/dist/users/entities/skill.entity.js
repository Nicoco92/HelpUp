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
exports.Skill = void 0;
const typeorm_1 = require("typeorm");
const user_skill_entity_1 = require("./user-skill.entity");
let Skill = class Skill {
    id;
    name;
    icon;
    description;
    userSkills;
};
exports.Skill = Skill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Skill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_skill_entity_1.UserSkill, (us) => us.skill),
    __metadata("design:type", Array)
], Skill.prototype, "userSkills", void 0);
exports.Skill = Skill = __decorate([
    (0, typeorm_1.Entity)('skills')
], Skill);
//# sourceMappingURL=skill.entity.js.map