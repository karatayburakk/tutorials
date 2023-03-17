// The useClass syntax allows you to dynamically determine a class that a token should resolve to.
// For example, suppose we have an abstract (or default) ConfigService class.
// Depending on the current environment, we want Nest to provide a different implementation of the configuration service.
// The following code implements such a strategy.

import { Module } from '@nestjs/common';

class ConfigService {}
class DevelopmentConfigService {}
class ProductionConfigService {} // We should use @Injectable() decorator to inject those dependencies

const configServiceProvider = {
  provide: ConfigService,
  useClass:
    process.env.NODE_ENV === 'development'
      ? DevelopmentConfigService
      : ProductionConfigService,
};

@Module({
  providers: [configServiceProvider],
})
export class UseClassModule {}

@Module({
  providers: [
    {
      provide: ConfigService,
      useClass:
        process.env.NODE_ENV === 'development'
          ? DevelopmentConfigService
          : ProductionConfigService,
    },
  ],
})
export class UseClassModule2 {}

// Let's look at a couple of details in this code sample.
// You'll notice that we define configServiceProvider with a literal object first, then pass it in the module decorator's providers property.
// This is just a bit of code organization, but is functionally equivalent to the examples we've used thus far in this chapter.

// Also, we have used the ConfigService class name as our token. For any class that depends on ConfigService,
// Nest will inject an instance of the provided class (DevelopmentConfigService or ProductionConfigService) overriding any default implementation
// that may have been declared elsewhere (e.g., a ConfigService declared with an @Injectable() decorator).
