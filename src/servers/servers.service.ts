import { Inject, Injectable, Logger } from '@nestjs/common';
import * as _ from 'lodash';
import axios from 'axios';
import { Server } from '../types';
import { ServerRepository } from './servers.repository';
import { appConfig } from '../config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConf: ConfigType<typeof appConfig>,
    private readonly serverRepository: ServerRepository,
  ) {}

  async getReachableServers(priority?: number) {
    const servers = this.serverRepository.getServers();
    if (!servers.length) return { servers: [] };

    const matchedServers = !!priority
      ? servers.filter((server) => server.priority === priority)
      : servers;

    // chunking can help manage large volumes of requests to avoid overwhelming services
    const batchs =
      this.appConf.batchSize > 0
        ? _.chunk(matchedServers, this.appConf.batchSize)
        : [matchedServers];
    const result: Server[] = [];

    for await (const batch of batchs) {
      const reachableServers = await this.checkBatchServersAvailability(batch);
      result.push(...reachableServers);
    }

    return {
      servers: _.orderBy(result, (s) => s.priority, 'asc'),
    };
  }

  async checkBatchServersAvailability(servers: Server[]) {
    const items = await Promise.all(
      servers.map(async (server) => {
        const isOnline = await this.checkServerAvailability(server.url);
        return { ...server, isOnline };
      }),
    );
    return items
      .filter((s) => s.isOnline)
      .map((s) => ({ url: s.url, priority: s.priority }));
  }

  async checkServerAvailability(url: string): Promise<boolean> {
    // TODO: Consider using redis for caching with a TTL to avoid unnecessary requests
    // This can significantly enhance performance and reduce load
    // TTL should be small enough to avoid serving stale data
    try {
      const response = await axios.get(url, {
        timeout: this.appConf.serverCallTimeout,
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      this.logger.error('Error checking server availability', error);
      return false;
    }
  }
}
