import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const builder = new DocumentBuilder()
    .setTitle('SOS Mulher Segura API')
    .setVersion('v0.4.0')
    .setDescription(
      [
        'Backend para **SOS Mulher Segura** — incidentes, despacho, voz (LiveKit), localização e notificações.',
        '',
        '### Autenticação',
        '- **Bearer JWT** em `Authorization: Bearer <token>`.',
        '- Roles: `CITIZEN`, `POLICE`, `ADMIN`.',
        '',
        '### Módulos',
        '- **Auth** · **Users** · **Incidents** · **Dispatch** · **Voice** · **Location** · **Devices** · **Notifications**',
        '',
        '### Convenções',
        '- Endpoints sob `/api`.',
        '- Timestamps em ISO-8601 (UTC).',
        '- `lat/lng` como decimais (6 casas).',
        '- Erros no formato `{ statusCode, message }`.',
        '',
        '### LGPD / Retenção',
        '- Limpeza automática de **LocationSample** e **IncidentEvent**.',
        '- Anonimização de incidentes fechados após janela definida.',
      ].join('\n'),
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token de acesso (Bearer JWT).',
      },
      'JWT',
    )
    // .setContact('SOS Mulher Segura', '', 'contato@sosmulher.segura')
    // Servers (ajuste se quiser ler de envs)
    .addServer('http://localhost:4000/api', 'Local (dev)')
    // .addServer(process.env.SWAGGER_SERVER_PROD!, 'Production') // opcional
    // Tags (aparecem na sidebar; os controllers podem usar @ApiTags para agrupar)
    .addTag('Auth', 'Authentication & session')
    .addTag('Users', 'Citizen & Police profiles')
    .addTag('Incidents', 'Create / list / close incidents')
    .addTag('Dispatch', 'Assign units & notifications')
    .addTag('Voice', 'LiveKit room join')
    .addTag('Location', 'Location samples & tracking')
    .addTag('Devices', 'FCM device registration');

  const document = SwaggerModule.createDocument(app, builder.build());

  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'SOS Mulher Segura API',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      filter: true,
    },
  });
}
