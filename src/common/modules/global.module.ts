// If you have to import the same set of modules everywhere, it can get tedious.
// Unlike in Nest, Angularproviders are registered in the global scope. Once defined, they're available everywhere.
// Nest, however, encapsulates providers inside the module scope.
// You aren't able to use a module's providers elsewhere without first importing the encapsulating module.

// When you want to provide a set of providers which should be available everywhere out-of-the-box (e.g., helpers, database connections, etc.),
//  make the module global with the @Global() decorator.

import { Module, Global } from '@nestjs/common';
import { CatsController } from '../../app/cats/cats.controller';
import { CatsService } from '../../app/cats/cats.service';

@Global()
@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class GlobalModule {}

// The @Global() decorator makes the module global-scoped.
// Global modules should be registered only once, generally by the root or core module.
// In the above example, the CatsService provider will be ubiquitous, and modules that wish to inject the service will not need to import the CatsModule in their imports array.

// HINT: Making everything global is not a good design decision. Global modules are available to reduce the amount of necessary boilerplate.
// The imports array is generally the preferred way to make the module's API available to consumers.
