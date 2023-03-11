// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { NestExpressApplication } from '@nestjs/platform-express';

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   await app.listen(3001);
// }
// bootstrap();

import { NestFactory } from '@nestjs/core'; // to create a Nest application instance.
import { AppModule } from './app/app.module'; // The root module of the App.
import { NestExpressApplication } from '@nestjs/platform-express'; // you don't need to specify a type unless you actually want to access the underlying platform API.

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await app.listen(3001);
}

bootstrap(); // The main.ts includes an async function, which will bootstrap our App

// To start Application run command in integrated terminal: npm run start, in DEV mode npm run start:dev
