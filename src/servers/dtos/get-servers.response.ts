import { ApiProperty } from '@nestjs/swagger';

export class Server {
  @ApiProperty({
    example: 'http://localhost:3000',
    description: 'The URL of the server',
  })
  url: string;

  @ApiProperty({
    example: 1,
    description: 'The priority of the server',
  })
  priority: number;
}

export class GetServersResponse {
  @ApiProperty({
    type: [Server],
    description: 'The list of servers',
  })
  servers: Server[];
}
