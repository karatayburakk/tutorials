// Guards
// A guard is a class annotated with @Injectable() decorator, which impements the CanActivate interface.

import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Injectable,
  Module,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { APP_GUARD, NestFactory, Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AppModule } from '../../app/app.module';
import { CreateCatDto } from '../../app/cats/dtos/create-cat.dto';

// Guards have a single responsibility.
// They determine whether a given request will be handled by the route handler or not, depending on certain conditions
// (like permissions, roles, ACLs, etc.) present at run-time
// This is often referred to as authorization. Authorization (and its cousin, authentication, with which it usually collaborates)
// has typically been handled by middleware in traditional Express applications.
// Middleware is a fine choice for authentication, since things like token validation and attaching properties to
// the request object are not strongly connected with a particular route context (and its metadata).

// But middleware, by its nature, is dumb. It doesn't know which handler will be executed after calling the next()
// function. On the other hand, Guards have access to the ExecutionContext instance, and thus know exactly
// what's goning to be executed next. They're designed, much like exception filters, pipes, and interceptors
// to let you interpose processing logic at exactly the right point in the request/response cycle,
// and to do so declaratively. This helps keep your code DRY and declarative.

// HINT:
// Guards are executed after all middleware, but before any interceptor or pipe.

// Authorization Guard:
// As mentioned, authorization is a greate use case for Guards because specific routes should be available only when
// the caller (usually a specific authenticated user) has sufficient permissions.
// The AuthGuard that we'll build now assumes an authenticated user (and that, therefore, a token is attached to the request
// headers). It will extract and validate the token, and use the extracted information to determine whether the reuqest
// can proceed or not.

// auth.guard.ts

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.validateRequest(request);
  }

  validateRequest(request: Request) {
    return request.body.user === 'admin';
  }
}

// HINT:
// If you are looking for a real-world example on how to implement an authentication mechanism in your application
// visit this chapter (https://docs.nestjs.com/security/authentication)
// Likewise, for more sophisticated authorization example, check this page (https://docs.nestjs.com/security/authorization)

// The logic inside the validateRequest() function can be as simple or sophisticated as needed.
// The main point of this example is to show how guards fit into the request/response cycle.

// Every guard must implement a canActivate() function. This function should return a boolean, indicating whether
// the current request is allowed or not. It can return the response either synchronouls or asynchronouls
// (via Promise or Observable). Nest usses the return value to control the next action:
// if it returns true, the request will be processed.
// if it returns false, Nest will deny the request.

// Execution Context:
// The canACtivate() function takes a single argument, the ExecutionContext instance. The ExecutioContext inherits
// from ArgumentsHost. We saw ArgumentsHost previously in the exception filters chapter. In the sample above,
// we're just using the same helper methods defined on ARgumentsHost that we used earlier, to get a reference
// to the Request object. You can refer back to the Arguments host secgion of the exception filters chapter for
// more on this topic.

// By extending ArgumentsHost, ExecutionContext also adds several new helper methods that provide additional details
// about the current execution process. These details can be helpful in building more generic guards that can work
// across a broad set of controllers, methods, and execution contexts. Learn more about ExecutionContext (https://docs.nestjs.com/fundamentals/execution-context)

// Role-based Authentication
// Let's build a more functional guard that permits access only to users with a specific role.
// We'll start with a basic guard template, and build on it in the coming sections. For now, it allows all request to proceed:

// roles.guard.ts

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return true;
  }
}

// Binding Guards:
// Like pipes and exception filtgers, guards can be controller-scoped, method-scoped, or global-scoped.
// Below, we set up a controller-scoped guard using the @UseGuards() decorator. This decorater may take a single argument,
// or a comma-seperated list of arguments. This lets you easily apply the appropriate set of guards with one declaration.

@Controller('cats')
@UseGuards(RolesGuard)
class CatsControllerWithGuard {}

// HINT:
// The @UseGuards() decorator is imported from the @nestjs/common package.

// Above, we passed the RolesGuard class (instead of an instance), leaving responsibility for instantiation to the framework
// and enabling dependenct injection. As with pipes and exception filters, we can also pass an in-place instance:

@Controller('cats')
@UseGuards(new RolesGuard())
class CatsControllerWithGuard2 {}

// The construction above attaches the guard to every handler declared by this controller. If we wish the guard to apply
// only to a single method, we apply the @UseGuards() decorator at the method level.

// In order to set up a global guard, use the useGlobalGuards() method of the Nest application instance:

const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());

// Global guards are used across the whole application, for every controller and every route handler.
// In ters of dependency injection, global guards registered from outside of any module (with useGlobalGuards() as in the example above)
// cannot inject dependencies since this is done outside the context of any module.
// In order to solve this issue, you can set up a guard directly from any module using the following construction:

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
class AppModuleWithGuard {}

// HINT:
// When using this approach to perform dependency injection for the guard, note that regardless of the module where this
//  construction is employed, the guard, in fafct, global. Where should be this done? Choose the module where the
// guard (RolesGuard in the example above) is defined. Also, useClass is not the only way of dealing with custom provider
// registration. Learn more here. (https://docs.nestjs.com/fundamentals/custom-providers)

// Setting Roles Per Handler:
// Our RolesGuard is working, but it's not very smart yet. We're not yet taking advantage of the most important guard feature-
// the execution context. It doesn't yet know about roles, or which roles are allowed for each handşer. The CatsController,
// for example, could have different permission schemes for different rotes. Some might be available only for an admin user,
// and others could be open for everyone. How can we match roles to routes in a fleciable and reusable way?

// This is where custom metadata comes into play (learn more here(https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata))
// Nest Provides the ability to attach custom metadata to route handlers through the @SetMatadata() decorator.
// This metadata supplies our missing role data, which a smart guard needs to make decisions. Let's take a look
// using @SetMetadata():

@Controller('cats')
class CatsControllerWithGuard3 {
  catsService: any;

  @Post()
  @SetMetadata('roles', ['admin'])
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}

// HINT:
// The @SetMetaData() decorator is imported from the @nestjs/common package.

// With the construction above, we attached the roles metadata (roles is a key, while ['admin] is a particular value)
// to the create() method. While this works, it's not good practice to use @SetMetadata() directly in your routes.
// Instead, create you own decorators as shown below:

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// This approach is much cleaner and more readable, and is strongly typed. Now that we have a custom @Roles() decorator,
// we can use it to decorate the create() method.

@Controller('cats')
class CatsControllerWithGuard4 {
  catsService: any;

  @Post()
  @Roles('admin')
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}

// Putting it all together:
// Let's now go back and tie this together with our RolesGuard. Currently, it simply return true in all cases,
// allowing every request to proceed. We want to make the return value conditional based on the comparing the
// roles assigned to the current user to the actual roles required by the current route being processed.
// In order to access the rout's role(s) (custom metadata), we'll use the Reflector helper class, which is provided
// out of the box by the framework and exposed from the @nestjs/core package.

@Injectable()
class RolesGuard2 implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.matchRoles(roles, user.role);
  }

  matchRoles(roles: string[], userRole: string) {
    return roles.includes(userRole);
  }
}

// HINT:
// In the node.js world, it's common practice to attach the authorized user to the request object.
// Thus, in our sample code aboce, we are assuming that request.user contains the user instance and allowed roles.
// In your app, you will probably make that association in your custom authentication guard (or middleware).
// Check this chapter for more information on this topic (https://docs.nestjs.com/security/authentication).

// WARNING:
// The logic inside the matchRoles() function can be as simple or sophisticated as needed. The main point of this example
// is to show how guard fit into the request/response cycle.

// Refer to the Reflection and metadata (https://docs.nestjs.com/fundamentals/execution-context#reflection-and-metadata)
// section of the Execution context chapter for more details on utilizing Reflector in a context-sensitive way.

// When a user with insufficient privileges quests an endpoint, Nest automatically return the following response:

const errorResponse = {
  statusCode: 403,
  message: 'Forbidden resource',
  error: 'Forbidden',
};

// Note that behind the scenes, when a guard returns false, the framework throws a ForbiddenException.
// If you want to return a different error response, you should throw your own specific exception. For example:
// throw new UnauthorizedException();

// Any exception thrown by a guard will be handled by the exceptions layer (global exceptions filter and any exceptions
// filters that are applied to the current context).

// HINT:
// If you are looking for a real-world example on how to implement authorization, check this chapter. (https://docs.nestjs.com/security/authorization)
