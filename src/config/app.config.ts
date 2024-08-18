import { Expose } from 'class-transformer';
import { IsNumberString } from 'class-validator';
import { registerAsWithValidation } from './configuration';

export class AppConfig {
  port: number;
  batchSize: number;
  serverCallTimeout: number;
}

class EnvConfig {
  @Expose()
  @IsNumberString()
  PORT: string;

  @Expose()
  @IsNumberString()
  BATCH_SIZE: string;

  @Expose()
  @IsNumberString()
  SERVER_CALL_TIMEOUT: string;
}

export const appConfig = registerAsWithValidation(
  'AppConfig',
  EnvConfig,
  process.env,
  (config): AppConfig => ({
    port: +config.PORT,
    batchSize: +config.BATCH_SIZE,
    serverCallTimeout: +config.SERVER_CALL_TIMEOUT,
  }),
);
