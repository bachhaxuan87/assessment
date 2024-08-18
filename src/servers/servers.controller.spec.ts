import { Test, TestingModule } from '@nestjs/testing';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { GetServersRequest, GetServersResponse } from './dtos';


describe('ServersController', () => {
  let controller: ServersController;
  let service: ServersService;

  beforeEach(async () => {
    const mockServersService = {
      getReachableServers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServersController],
      providers: [
        {
          provide: ServersService,
          useValue: mockServersService,
        },
      ],
    }).compile();

    controller = module.get<ServersController>(ServersController);
    service = module.get<ServersService>(ServersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReachableUrls', () => {
    it('should return the result from ServersService.getReachableServers', async () => {
      // Arrange
      const request: GetServersRequest = { priority: 1 };
      const expectedResponse: GetServersResponse = {
        servers: [{ url: 'https://github.com', priority: 1 }],
      };
      jest.spyOn(service, 'getReachableServers').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getReachableUrls(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.getReachableServers).toHaveBeenCalledWith(request.priority);
    });

    it('should handle cases where no priority is provided', async () => {
      // Arrange
      const request: GetServersRequest = {};
      const expectedResponse: GetServersResponse = { servers: [] };
      jest.spyOn(service, 'getReachableServers').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getReachableUrls(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.getReachableServers).toHaveBeenCalledWith(undefined);
    });

    it('should return an empty array when ServersService returns an empty array', async () => {
      // Arrange
      const request: GetServersRequest = { priority: 2 };
      const expectedResponse: GetServersResponse = { servers: [] };
      jest.spyOn(service, 'getReachableServers').mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.getReachableUrls(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(service.getReachableServers).toHaveBeenCalledWith(request.priority);
    });
  });
});
