import { Test, TestingModule } from '@nestjs/testing';
import { ServersService } from './servers.service';
import axios from 'axios';
import { ServerRepository } from './servers.repository';
import * as MockAdapter from 'axios-mock-adapter';
import { appConfig } from '../config';
import { ConfigType } from '@nestjs/config';

const mockConfigProvider = {
  provide: appConfig.KEY,
  useValue: {
    port: 3000,
    batchSize: 100,
    serverCallTimeout: 5000,
  },
};

var axiosMock = new MockAdapter(axios);
const mockServerRepository = {
  getServers: jest.fn(),
};

describe('ServersService', () => {
  let service: ServersService;
  let appConf: ConfigType<typeof appConfig>;

  beforeEach(async () => {
    jest.resetModules();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        mockConfigProvider,
        ServersService,
        { provide: ServerRepository, useValue: mockServerRepository },
      ],
    }).compile();

    service = module.get<ServersService>(ServersService);
    appConf = module.get(appConfig.KEY);
  });

  afterEach(() => {
    axiosMock.reset();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReachableServers', () => {
    it('should return reachable servers', async () => {
      // Arrange
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://gitlab.com', priority: 4 },
        { url: 'https://github.com', priority: 4 },
      ]);

      axiosMock.onGet().reply(200);

      // Act
      const result = await service.getReachableServers();

      // Assert
      expect(result).toEqual({
        servers: [
          { url: 'https://gitlab.com', priority: 4 },
          { url: 'https://github.com', priority: 4 },
        ],
      });
    });

    it('should handle HTTP errors and return reachable status accordingly', async () => {
      // Arrange
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://does-not-work.perfume.new', priority: 1 },

        {
          url: 'https://github.com',
          priority: 4,
        },
      ]);

      axiosMock.onGet('https://does-not-work.perfume.new').networkError(); // Simulate an error
      axiosMock.onGet('https://github.com').reply(200);

      // Act
      const result = await service.getReachableServers();

      // Assert
      expect(result).toEqual({
        servers: [{ url: 'https://github.com', priority: 4 }],
      });
    });

    test.each([
      // Informational responses (status codes < 200)
      [100, `https://github-${1}.com`, false], // Continue
      [101, `https://github-${2}.com`, false], // Switching Protocols
      [102, `https://github-${3}.com`, false], // Processing
      [103, `https://github-${4}.com`, false], // Early Hints

      // Successful responses
      [200, `https://github-${5}.com`, true], // OK
      [201, `https://github-${6}.com`, true], // Created
      [204, `https://github-${7}.com`, true], // No Content

      // Redirection responses
      [301, `https://github-${8}.com`, false], // Moved Permanently
      [302, `https://github-${9}.com`, false], // Found (Previously "Moved Temporarily")

      // Client error responses
      [400, `https://github-${10}.com`, false], // Bad Request
      [401, `https://github-${11}.com`, false], // Unauthorized
      [403, `https://github-${12}.com`, false], // Forbidden
      [404, `https://github-${13}.com`, false], // Not Found

      // Server error responses
      [500, `https://github-${14}.com`, false], // Internal Server Error
      [502, `https://github-${15}.com`, false], // Bad Gateway
      [503, `https://github-${16}.com`, false], // Service Unavailable
      [504, `https://github-${17}.com`, false], // Gateway Timeout
    ])(
      'should handle HTTP status code %i for URL %s and return urls accordingly',
      async (statusCode, url, isOnline) => {
        // Arrange
        jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
          {
            url,
            priority: 4,
          },
        ]);
        axiosMock.onGet(url).reply(statusCode);

        // Act
        const result = await service.getReachableServers();

        // Assert
        expect(result.servers.length).toBe(isOnline ? 1 : 0);
        expect(result).toEqual(
          isOnline ? { servers: [{ url, priority: 4 }] } : { servers: [] },
        );
      },
    );

    it('should handle timeout errors and return reachable status accordingly', async () => {
      // Arrange
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://timeout.new', priority: 1 },
        {
          url: 'https://github.com',
          priority: 4,
        },
      ]);

      axiosMock.onGet('https://timeout.new').timeout(); // Simulate a timeout
      axiosMock.onGet('https://github.com').reply(200);

      // Act
      const result = await service.getReachableServers();

      // Assert
      expect(result).toEqual({
        servers: [{ url: 'https://github.com', priority: 4 }],
      });
    }, 10000);

    it('should handle priority params and return reachable status accordingly', async () => {
      // Arrange
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://does-not-work.perfume.new', priority: 1 },
        {
          url: 'https://gitlab.com',
          priority: 4,
        },
        {
          url: 'https://github.com',
          priority: 4,
        },
        {
          url: 'http://app.scnt.me',
          priority: 3,
        },
      ]);

      axiosMock.onGet().reply(200);

      // Act
      const result = await service.getReachableServers(4);

      // Assert
      expect(result).toEqual({
        servers: [
          { url: 'https://gitlab.com', priority: 4 },
          { url: 'https://github.com', priority: 4 },
        ],
      });
    });

    it('should handle empty server list if no servers matched', async () => {
      // Arrange
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
        { url: 'https://does-not-work.perfume.new', priority: 1 },
        {
          url: 'https://gitlab.com',
          priority: 4,
        },
        {
          url: 'https://github.com',
          priority: 4,
        },
        {
          url: 'http://app.scnt.me',
          priority: 3,
        },
      ]);

      axiosMock.onGet('https://gitlab.com').reply(200);
      const axiosSpy = jest.spyOn(axios, 'get');
      // Act
      const result = await service.getReachableServers(100);

      // Assert
      expect(result).toEqual({
        servers: [],
      });
    });

    it('should handle empty server list', async () => {
      // Arrange
      jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([]);
      axiosMock.onGet('https://gitlab.com').reply(200);

      // Act
      const result = await service.getReachableServers();

      // Assert
      expect(result).toEqual({
        servers: [],
      });
    });

    test.each([
      [3000, 3000],
      [4000, 4000],
      [5000, 5000],
    ])(
      'Given %p online servers, the result should include %p URLs',
      async (totalUrls, totalExpectedUrls) => {
        // Arrange
        jest.spyOn(mockServerRepository, 'getServers').mockReturnValue(
          new Array(totalUrls).fill(null).map((_, idx) => ({
            url: `https://github-${idx}.com`,
            priority: 4,
          })),
        );
        axiosMock.onGet().reply(200);

        // Act
        const result = await service.getReachableServers();

        // Assert
        expect(result.servers.length).toBe(totalExpectedUrls);
      },
    );

    test.each([
      [3000, 3000],
      [4000, 4000],
      [5000, 5000],
    ])(
      'Given a timeout of %p, Axios should be called with the expected timeout of %p',
      async (timeout) => {
        // Arrange
        jest.spyOn(mockServerRepository, 'getServers').mockReturnValue([
          {
            url: 'https://github.com',
            priority: 4,
          },
        ]);
        axiosMock.onGet().reply(200);
        const axiosSpy = jest.spyOn(axios, 'get');
        appConf.serverCallTimeout = timeout;
        // Act
        const result = await service.getReachableServers();

        // Assert
        expect(axiosSpy).toHaveBeenCalledWith(
          expect.stringContaining('https://github.com'),
          expect.objectContaining({ timeout }),
        );
        expect(result).toEqual({
          servers: [{ url: 'https://github.com', priority: 4 }],
        });
      },
    );

    test.each([
      [1000, 10, 100],
      [1000, 20, 50],
      [1000, 50, 20],
      [1000, 100, 10],
      [1001, 100, 11],
      [1000, 0, 1],
      [1000, -1, 1],
    ])(
      'given total urls is %p, batchSize as %p, total batch should be %p',
      async (totalUrls, batchSize, expectedCalls) => {
        // Arrange
        jest.spyOn(mockServerRepository, 'getServers').mockReturnValue(
          new Array(totalUrls).fill(null).map((_, idx) => ({
            url: `https://github-${idx}.com`,
            priority: 4,
          })),
        );
        const checkBatchServersAvailabilitySpy = jest.spyOn(
          service,
          'checkBatchServersAvailability',
        );

        axiosMock.onGet().reply(200);
        appConf.batchSize = batchSize;

        // Act
        const result = await service.getReachableServers();

        // Assert
        expect(checkBatchServersAvailabilitySpy).toHaveBeenCalledTimes(
          expectedCalls,
        );
        expect(axios.get).toHaveBeenCalledTimes(totalUrls);
        expect(result.servers.length).toBe(totalUrls);
      },
    );
  });
});
