import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { ServersModule } from '../src/servers/servers.module';
import axios from 'axios';
import { ServerRepository } from '../src/servers/servers.repository';
import { ServersService } from '../src/servers/servers.service';
import MockAdapter from 'axios-mock-adapter';
import { appConfig } from '../src/config';

const mockConfigProvider = {
  provide: appConfig.KEY,
  useValue: {
    port: 3000,
    batchSize: 100,
    serverCallTimeout: 5000,
  },
};

// Mock HttpService
var axiosMock = new MockAdapter(axios);

// Mock ServerRepository
const mockServerRepository = {
  getServers: jest.fn(),
};

describe('ServersModule e2e Tests', () => {
  let app: INestApplication;
  let service: ServersService;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfig],
        }),
        ServersModule,
      ],
    })
      .overrideProvider(appConfig.KEY)
      .useValue(mockConfigProvider)
      .overrideProvider(ServerRepository)
      .useValue(mockServerRepository)
      .compile();

    app = testModule.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );
    await app.init();

    service = app.get<ServersService>(ServersService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('Service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('/servers (GET)', () => {
    it('Should return servers with status 200', async () => {
      // ARRANGE
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://gitlab.com', priority: 1 },
        { url: 'https://github.com', priority: 2 },
      ]);
      axiosMock.onGet().reply(200);
      const params = {};

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/servers?${new URLSearchParams(params).toString()}`)
        .expect(200);

      // ASSERT
      const { servers } = response.body;
      expect(servers).toHaveLength(2);
      expect(servers[0]).toHaveProperty('url', 'https://gitlab.com');
      expect(servers[1]).toHaveProperty('url', 'https://github.com');
    });

    it('Should validate priority query string as number', async () => {
      // ARRANGE
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://gitlab.com', priority: 1 },
        { url: 'https://github.com', priority: 2 },
      ]);
      axiosMock.onGet().reply(200);
      const params = {
        priority: 'invalid',
      };

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/servers?${new URLSearchParams(params).toString()}`)
        .expect(400);

      // ASSERT
      expect(response.body.message).toEqual([
        'priority must be a number string',
      ]);
    });
  });
});
