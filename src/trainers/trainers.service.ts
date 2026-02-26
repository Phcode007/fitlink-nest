import { Injectable } from '@nestjs/common';

@Injectable()
export class TrainersService {
  getTrainerDashboard(userId: string) {
    return { message: `Trainer dashboard for user ${userId}` };
  }
}
