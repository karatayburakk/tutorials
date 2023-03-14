// The useExisting syntax allows you to create aliases for existing providers.
// This creates two ways to access the same provider.
// In the example below, the (string-based) token 'AliasedLoggerService' is an alias for the (class-based) token LoggerService.
// Assume we have two different dependencies, one for 'AliasedLoggerService' and one for LoggerService.
// If both dependencies are specified with SINGLETON scope, they'll both resolve to the same instance.

import { Injectable, Module } from '@nestjs/common';

@Injectable()
class LoggerService {
  // Implementation...
}

const loggerAliasProvider = {
  provide: 'AliasedLoggerService',
  useExisting: LoggerService,
};

@Module({
  providers: [LoggerService, loggerAliasProvider],
})
export class UseExistingProviderModule {}
