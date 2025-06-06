import { ConfigModule, ConfigService } from '@nestjs/config';
import { IRMQServiceAsyncOptions } from 'nestjs-rmq';

export const getRMQConfig = (): IRMQServiceAsyncOptions => ({
  inject: [ConfigService],
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    exchangeName: configService.get('AMQP_EXCHANGE') ?? '',
    connections: [
      {
        login: configService.get('AMQP_LOGIN_USER') ?? '',
        password: configService.get('AMQP_PASSWORD_USER') ?? '',
        host: configService.get('AMQP_HOSTNAME') ?? '',
      },
    ],
    queueName: configService.get('AMQP_QUEUE'),
    prefetchCount: 32,
    serviceName: 'api-ms',
  }),
});
