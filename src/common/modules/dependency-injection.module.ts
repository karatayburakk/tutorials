// A module class can inject providers as well (e.g., for configuration purposes):

import { Module } from '@nestjs/common';
import { CatsController } from '../../app/cats/cats.controller';
import { CatsService } from '../../app/cats/cats.service';

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class DependencyInjectedModule {
  constructor(private catsService: CatsService) {}
}

// However, module classes themselves cannot be injected as providers due to circular dependency .
