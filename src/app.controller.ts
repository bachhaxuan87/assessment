import { Controller, Get } from '@nestjs/common';
@Controller()
export class AppController {
  constructor() {}

  @Get('/health-check')
  async healthCheck() {
    return {
      status: 'OK',
    };
  }
}
