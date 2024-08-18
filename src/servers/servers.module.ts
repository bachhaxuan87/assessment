import { Module } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { HttpModule } from '@nestjs/axios';
import { ServerRepository } from './servers.repository';

@Module({
  imports: [HttpModule],
  controllers: [ServersController],
  providers: [ServersService, ServerRepository],
})
export class ServersModule {}
