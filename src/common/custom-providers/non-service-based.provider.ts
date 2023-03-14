// While providers often supply services, they are not limited to that usage.
// A provider can supply any value. For example, a provider may supply an array of configuration objects based on the current environment, as shown below:

import { Module } from '@nestjs/common';

const devConfig = {
  config: 'dev',
};

const prodConfig = {
  config: 'prod',
};

const configFactory = {
  provide: 'CONFIG',
  useFactory: () => {
    return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
  },
};

@Module({
  providers: [configFactory],
})
export class NonServiceBasedProviderModule {}
