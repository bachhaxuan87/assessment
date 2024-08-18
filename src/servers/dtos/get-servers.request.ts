import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetServersRequest {
  @ApiProperty({
    example: 1,
    description: 'The priority of servers to return',
    required: false,
  })
  @IsNumberString()
  @IsOptional()
  priority?: number;
}
