/* Providers are a fundamental concept in Nest. 
Many of the basic Nest classes may be treated as a provider – services, repositories, factories, helpers, and so on. 
The main idea of a provider is that it can be injected as a dependency; this means objects can create various relationships with each other,
and the function of "wiring up" instances of objects can largely be delegated to the Nest runtime system. */

import { Injectable } from '@nestjs/common'; // The only new feature is that it uses the @Injectable() decorator.
// The @Injectable() decorator attaches metadata, which declares that CatsService is a class that can be managed by the Nest IoC container.
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat): Cat {
    this.cats.push(cat);

    return this.cats[this.cats.length - 1];
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
