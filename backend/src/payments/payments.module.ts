import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Transaction } from './entities/transaction.entity';
import { Subscription } from './entities/subscription.entity';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { Mission } from '../missions/entities/mission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Subscription, Referral, User, Mission]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
