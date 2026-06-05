import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { MissionApplication } from './entities/mission-application.entity';
import { MissionCategory } from './entities/mission-category.entity';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, MissionApplication, MissionCategory]),
    NotificationsModule,
    PaymentsModule,
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
