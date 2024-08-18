import { Injectable } from '@nestjs/common';
import { Server } from '../types';
import * as servers from '../servers.json';

@Injectable()
export class ServerRepository {
  getServers(): Server[] {
    return servers;
  }
}
