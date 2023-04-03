// Custom Route Decorators
// Nest is built around a language featured called decorators.
// Decorators are a well-knbown concept in a lot of commonly used programming languages, but in JavaScript world, they're
// still relatively new. In order to better understand how decorators work, we recommended reading this article
// (https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841).
// Here's a simple definition:

import {
  Controller,
  ExecutionContext,
  Get,
  SetMetadata,
  UseGuards,
  ValidationPipe,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../guards/guards.guard';

// An ES2016 decorator is an expression which returns a function and can take a target, name and property descriptor as arguments.
// You apply it by prefixing the decorator with an @ character and placing this at the very top of what you are trying to decorate.
// Decorators can be defined for etiher a class, a method or a property.

// Param Decorators:
// Nest provides a set of useful param decorators that you can use together with the HTTP route handlers.
// Below is a list of the provided decorators and the plain Express (or Fastify) object they represent.
// @Request(), @Req() -> req
// @Response(), @Res() -> res
// @Next() -> next
// @Session() -> req.session
// @Param(param?: string) -> req.params / req.params[param]
// @Body(param?: string) -> req.body / req.body[param]
// @Query(param?: string) -> req.query / req.query[param]
// @Headers(param?: string) -> req.headers / req.headers[param]
// @Ip() -> req.ip
// @HostParam() -> req.hosts

// Additionaly, you can create your own custom decorators. Why is this useful?
// In the node.js world, it's common practice to attach properties to the request object.
// Then you manually extract them in each route handler, using code like the following:
// const user = req.user

// In order to make your code more readable and transparent, you can create a @User() decorator and reuse it
// across all of your controllers.

// user.decorators.ts

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);

// Then, you can simply use it whereever it fits your requirements.

export interface UserEntity {
  id: number;
  name: string;
  email: string;
}

@Controller('cats')
class CatsControllerWithDecorator {
  @Get()
  async findOne(@User() user: UserEntity) {
    console.log(user);
  }
}

// Passing Data:
// When the behavior of your decorator depends on some conditions, you can use the data parameter to pass an argument
// to the decorator's factory function. One use case for this is a custom decorator that extracts properties from the request
// object by key. Let's assume, for example, that our authentication layer validates requests and attaches a user entity
// to request object. The user entity for an authenticated request might look like:

const user = {
  id: 101,
  firstName: 'Alan',
  lastName: 'Turing',
  roles: ['admin'],
};

// Let's define a decorator that takes a property name as key, and returns the associated value if it exists
// (or undefined if it doesn't exist, or if the user object has not been created).

// user.decorator.ts

export const UserWithPassingData = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Here's how you could then access a particular property via the @User() decorator in the controller:

@Controller('cats')
class CatsControllerWithDecorator2 {
  @Get()
  async findOne(@UserWithPassingData('firstName') firstName: string) {
    console.log(`Hello ${firstName}`);
  }
}

// You can use this same decorator with different keys to access different properties.
// If the user object is deep or complex, this can make for easier and more readable request handler implementations.

// HINT:
// For TypeScript users, note that createParamDecorator<T>() is a generic. This means you can explicitly enforce type
// safety, for example createParamDecorator<string>((data, ctx) => ...). Alternatively, specify a parameter type in
// the factory function, for example createParamDecorator((data: string, ctx) => ...).
// If you omit both, the type for data will be any.

// Working With Pipes:
// Nest treats custom param decorators in the same fashion as the built-in ones (@Body(), @Param(), and @Query()).
// This means that pipes are executed for the custom annotated parameters as well (in our examples, the user argument).
// Moreover, you can apply the pipe directly to the custom decorator:

@Controller('cats')
class CatsControllerWithDecoratorAndPipe {
  @Get()
  async findOne(
    @User(new ValidationPipe({ validateCustomDecorators: true }))
    user: UserEntity,
  ) {
    console.log('user', user);
  }
}

// HINT:
// Note that validateCustomDecorators option msut be set to true. ValidaitonPipe does not validate arguments
// annotated with the custom decorators by default.

// Decorator Composition
// Nest provides a helper method to compose multiple decorators. For example, suppose you want to combine all
// decorators related to authentication into a single decorator. This could be done with the following construction:

// auth.decorator.ts

export enum Role {
  Admin = 'admin',
  User = 'user',
  Manager = 'manager',
}

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
function ApiBearerAuth(): ClassDecorator | MethodDecorator | PropertyDecorator {
  throw new Error('Function not implemented.');
}
function ApiUnauthorizedResponse(arg0: {
  description: string;
}): ClassDecorator | MethodDecorator | PropertyDecorator {
  throw new Error('Function not implemented.');
}

// You can then use this custom @Auth() decorator as follows:

@Controller('cats')
class CatsControllerWithDecoratorComposition {
  @Get('users')
  @Auth(Role.Admin)
  findAllUsers() {
    //
  }
}

// This has the effect of applying all four decorators with a single declaration.

// WARNING:
// The @ApiHideProperty() decorator from the @nestjs/swagger package is not composable and won't work properly with the
// applyDecorators function
