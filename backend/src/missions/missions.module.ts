import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mission } from './entities/mission.entity';
import { MissionApplication } from './entities/mission-application.entity';
import { MissionCategory } from './entities/mission-category.entity';
import { MissionsService } from './missions.service';
import { MissionsController } from './missions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, MissionApplication, MissionCategory]),
  ],
  controllers: [MissionsController],
  providers: [MissionsService],
  exports: [MissionsService],
})
export class MissionsModule {}
