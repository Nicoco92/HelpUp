"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const seed_service_1 = require("./seed.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const missions_module_1 = require("./missions/missions.module");
const payments_module_1 = require("./payments/payments.module");
const chat_module_1 = require("./chat/chat.module");
const reviews_module_1 = require("./reviews/reviews.module");
const notifications_module_1 = require("./notifications/notifications.module");
const mission_category_entity_1 = require("./missions/entities/mission-category.entity");
const skill_entity_1 = require("./users/entities/skill.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USER'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_NAME'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                }),
            }),
            typeorm_1.TypeOrmModule.forFeature([mission_category_entity_1.MissionCategory, skill_entity_1.Skill]),
            schedule_1.ScheduleModule.forRoot(),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            missions_module_1.MissionsModule,
            payments_module_1.PaymentsModule,
            chat_module_1.ChatModule,
            reviews_module_1.ReviewsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, seed_service_1.SeedService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map