import { Injectable } from '@nestjs/common';

@Injectable()
export class NutritionistsService {
  getNutritionistDashboard(userId: string) {
    return { message: `Nutritionist dashboard for user ${userId}` };
  }
}
