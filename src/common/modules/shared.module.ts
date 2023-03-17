// In Nest, modules are singletons by default, and thus you can share the same instance of any provider between multiple modules effortlessly.
// Every module is automatically a shared module. Once created it can be reused by any module.
// Let's imagine that we want to share an instance of the CatsService between several other modules.
// In order to do that, we first need to export the CatsService provider by adding it to the module's exports array, as shown below:

import { Module } from '@nestjs/common';
import { CatsController } from '../../app/cats/cats.controller';
import { CatsService } from '../../app/cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class SharedModule {}

// Now any module that imports the CatsModule has access to the CatsService and will share the same instance with all other modules that import it as well.
