import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DietsModule } from './diets/diets.module';
import { NutritionistsModule } from './nutritionists/nutritionists.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TrainersModule } from './trainers/trainers.module';
import { UsersModule } from './users/users.module';
import { WorkoutsModule } from './workouts/workouts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TrainersModule,
    NutritionistsModule,
    WorkoutsModule,
    DietsModule,
    ProgressModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
