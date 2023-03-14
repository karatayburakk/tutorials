//So far, we've used class names as our provider tokens (the value of the provide property in a provider listed in the providers array).
//This is matched by the standard pattern used with constructor based injection, where the token is also a class name.
//(Refer back to DI Fundamentals for a refresher on tokens if this concept isn't entirely clear).
// Sometimes, we may want the flexibility to use strings or symbols as the DI token. For example:

import { Inject, Injectable, Module } from '@nestjs/common';
import { Connection, connection } from './connection';

@Module({
  providers: [
    {
      provide: 'CONNECTION',
      useValue: connection,
    },
  ],
})
export class ConnectionModule {}

// In this example, we are associating a string-valued token ('CONNECTION') with a pre-existing connection object we've imported from an external file.

// We've previously seen how to inject a provider using the standard constructor based injection pattern.
// This pattern requires that the dependency be declared with a class name.
// The 'CONNECTION' custom provider uses a string-valued token. Let's see how to inject such a provider.
// To do so, we use the @Inject() decorator. This decorator takes a single argument - the token.

@Injectable()
export class ConnectionRepository {
  constructor(@Inject('CONNECTION') private connection: Connection) {}
}

// While we directly use the string 'CONNECTION' in the above examples for illustration purposes, for clean code organization, it's best practice to define tokens in a separate file, such as constants.ts.
// Treat them much as you would symbols or enums that are defined in their own file and imported where needed
