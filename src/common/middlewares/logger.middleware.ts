// Middleware
// Middleware is a function which is called before the route handler.
// Middleware functions have access to the request and response objexts, and the next() middleware function in the
// application's request-response cycle.
// The next middleware function is commonly denoted by a variable named next.

// Client Side ----> (Http Request) ---> Middleware ---> Route Handler @RequestMapping

// Nest middleware are, by default, equivalent to express middleware.
// The following descriptiojn from the offical express documentation describes the capabilities of middleware:

// Middleware functions can perform the following tasks:
// - Execute any code.
// - Make changes to the request and the response objects.
// - End the request-response cycle.
// call the next middleware function in the stack.
// if the current middleware function does not end the request-resposne cycle, it must call next() to pass control
// to the next middleware function. Otherwise, the request will be left hanging.

// You implement custom Nest middleware in either a function, or in a class with an @Injectable() decorator.
// The class should implement the NestMiddleware interface, while the function does not have any spedcial requirements.
// Let's start by implementing a simple middleware feature using the class method.

import {
  Injectable,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CatsModule } from '../../app/cats/cats.module';
import { CatsController } from '../../app/cats/cats.controller';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}

// Dependency Injection
// Nest middleware fully supports Dependency Injection. Just as with providers and controllers,
// they are able to inject dependencies that are available within the same module.
// As usula, this is done through the constructor.

// Applying Middleware
// There is no place for middleware in the @Module() decorator.
// Instead, we set them up using the configure() method of the module class.
// Modules that include middleware have to implement the NestModule interface.
// Let's set up the LoggerMiddleware at the AppModule level.

@Module({
  imports: [CatsModule],
})
export class AppModuleWithMiddleware implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('cats');
  }
}

// In the Above example we have set up the LoggerMiddleware fot the /cats route handlers that were
// previously defined inside the CatsControler.
// We may also further restrict a middleware to a particular request method by passing an object containing
// the route path and request method to the forRoutes() method when configuring the middleware.
// In the example below, notice that we import the RequestMEthod enum to reference the desired request method type

@Module({
  imports: [CatsModule],
})
export class AppModuleWithMiddleware2 implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}

// HINT:
// the configure() method can be made asynchronous using async/await (e.g., you can await completion of an asynchronous operation inside the configure() method body)

// Route wildcards
// Pattern based routes are supported as well.
// For instance, the astrisk is used as a wildcard, and will match any combination of characters:
// forRoutes({path: 'ab*cd', method: RequestMethod.ALL});
// The 'ab*cd' route path will match abcd, ab_cd, abecd, and so on.
// The characters ?, +, *, and () may be used in a route path, and are subsets of their regular expression counterparts.
// The hyphen ( - ), and the dot ( . ) are interpreted literally by string-based paths.

// Middleware Consumer
// The MiddlewareConsumer is a helper class.
// It provides several built-in methods to manage middleware.
// All of them can be simply chained in the 'fluent style'.
// The forRoutes() method can take a single string, multiple strings, a RouteInfo object,
// a controller class and even multiple controller classes.
// In most cases you'll probably just pass a list of controllers spereated by commas.
// Below is an example with a single controller:

@Module({
  imports: [CatsModule],
})
export class AppModuleWithMiddleware3 implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatsController);
  }
}

// HINT:
// The apply() method mat either take a single middleware, or multiple arguments to specify multiple middlewares.

// Excluding Routes
// At times we want to exclude certain routes from hjaving the middleware applied.
// We can easily exclude certain routes with the exclude() method.
// This method can take a single string, multiple strings, or a RouteInfo object identifying routes to be excluded, as shown below:

@Module({
  imports: [CatsModule],
})
export class AppModuleWithMiddleware4 implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude(
        {
          path: 'cats',
          method: RequestMethod.GET,
        },
        { path: 'cats', method: RequestMethod.POST },
        'cats/(.*)',
      )
      .forRoutes(CatsController);
  }
}

// Functional Middleware
// The LoggerMiddleware class we've been using is quite simple.
// It has no members, no additional methods, and no dependencies.
// Why can't we just define it in a simple function insted of a class?
// In fact, we can. This type of middleware is called functional middleware.
// Let's transform the logger middleware from class-based into functional middleware to illustrate the difference:

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}

@Module({
  imports: [CatsModule],
})
export class AppModuleWithMiddleware5 implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(CatsController);
  }
}

// HINT:
// Consider using the simpler functional middleware alternative any time your middleware doesn't need any dependencies.

// Multiple Middleware
// as mentioned aboce, in orter to bind multiple middleware that are executed sequentially,
// simply provide a comma seperated list inside the apply() method:
// consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);

// Global Middleware
// If we want to bind middleware to every registered route at once, we can use the use() method that is supplied by the
// INestApplication instance:
// main.ts:
// const app = await NestFactory.create(AppModule);
// app.use(logger);
// await app.listen(300)

// HINT:
// Accessing the DI container in a global middleware is not possible.
// You can use a functional middleware insted when using app.use().
// Alternatively, you can use a class middleware and consume it with .forRoutes('*')
// within the AppModule (or any other module)
