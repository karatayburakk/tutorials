// Like any provider, a custom provider is scoped to its declaring module.
// To make it visible to other modules, it must be exported.
// To export a custom provider, we can either use its token or the full provider object.

import { Module } from '@nestjs/common';
import { DatabaseConnection, OptionsProvider } from './useFactory.provider';

// The following example shows exporting using the token:

const connectionFactory = {
  provide: 'CONNECTION',
  useFactory: (optionsProvider: OptionsProvider) => {
    const options = optionsProvider.get();
    return new DatabaseConnection(options);
  },
  inject: [OptionsProvider],
};

@Module({
  providers: [connectionFactory],
  exports: ['CONNECTION'],
})
export class ExportCustomProviderModule {}

@Module({
  providers: [connectionFactory],
  exports: [connectionFactory],
})
export class ExportCustomProviderModule2 {}
