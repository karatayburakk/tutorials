// Value providers
// The useValue syntax is useful for injecting a constant value, putting an external library into the Nest container, or replacing a real implementation with a mock object.
// Let's say you'd like to force Nest to use a mock CatsService for testing purposes.

import { Module } from '@nestjs/common';
import { CatsService } from '../app/cats/cats.service';
import { CatsModule } from '../app/cats/cats.module';

const mockCatsService = {
  // Mock implementation
};

@Module({
  imports: [CatsModule],
  providers: [
    {
      provide: CatsService,
      useValue: mockCatsService,
    },
  ],
})
export class CatModuleMock {}

// In this example, the CatsService token will resolve to the mockCatsService mock object.
// useValue requires a value - in this case a literal object that has the same interface as the CatsService class it is replacing.
//  Because of TypeScript's structural typing, you can use any object that has a compatible interface, including a literal object or a class instance instantiated with new.
