// Controllers are responsible for handling incoming requests and returning responses to the client.
// In order to create a basic controller, we use classes and decorators

// import { Controller, Get } from '@nestjs/common';

// @Controller('cats')
// export class CatsController {
//   @Get()
//   findAll(): string {
//     return `This action resturns all cats`;
//   }
// }

import { Controller, Get, Header, HttpCode, Param } from '@nestjs/common'; // we'll use the @Controller() decorator, which is required to define a basic controller. The @Get() HTTP request method decorator before the findAll() method tells Nest to create a handler for a specific endpoint for HTTP requests.
import { Observable, of } from 'rxjs';

@Controller('cats')
export class CatsController {
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  @Get()
  findAll(): string {
    return 'this action returns all cats';
  }

  @Get(':id')
  findOneById(@Param() params): string {
    console.log(params.id);
    return `This action returns a #${params.id} cat`;
  }

  @Get('async')
  async findAsync(): Promise<any[]> {
    return [];
  }

  @Get('observable')
  findObservable(): Observable<any[]> {
    return of([]);
  }
}

// Request object#
// Handlers often need access to the client request details. Nest provides access to the request object of the underlying platform (Express by default).
//  We can access the request object by instructing Nest to inject it by adding the @Req() decorator to the handler's signature.

// The request object represents the HTTP request and has properties for the request query string, parameters, HTTP headers, and body (read more here). In most cases, it's not necessary to grab these properties manually.
// We can use dedicated decorators instead, such as @Body() or @Query(), which are available out of the box. Below is a list of the provided decorators and the plain platform-specific objects they represent.
