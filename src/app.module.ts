import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { ServersModule } from './servers/servers.module';
import { LoggerModule } from 'nestjs-pino';
import { appConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        formatters: {
          level: (label) => {
            return { level: label.toUpperCase() };
          },
        },        
        redact: ['req.headers.authorization', 'req.body.password'],
      },
    }),
    ServersModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
