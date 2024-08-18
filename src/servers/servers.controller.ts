import { Controller, Get, Query } from '@nestjs/common';
import { ServersService } from './servers.service';
import { GetServersRequest, GetServersResponse } from './dtos';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('servers')
@Controller({
  path: 'servers',
  version: '1',
})
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  @ApiOkResponse({ type: GetServersResponse })
  @ApiBadRequestResponse()
  async getReachableUrls(@Query() request: GetServersRequest) {
    return this.serversService.getReachableServers(
      +request.priority || undefined,
    );
  }
}
