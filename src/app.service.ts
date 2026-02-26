import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { message: 'FitLink API is running' };
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'fitlink-api',
      timestamp: new Date().toISOString(),
    };
  }
}
