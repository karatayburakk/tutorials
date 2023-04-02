import { IsInt, IsString, validate } from 'class-validator';
import { CreateCatDto } from '../../app/cats/dtos/create-cat.dto';
// Pipes
// A pipe is a class annotated with @Injectable() decorator, which implements the PipeTransform interface

import {
  ArgumentMetadata,
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Injectable,
  Module,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  PipeTransform,
  Post,
  Query,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { APP_PIPE, NestFactory } from '@nestjs/core';
import { AppModule } from '../../app/app.module';

// Pipes have two typical use cases:
// transformation: transform input data to the desired form (e.g., from string to integer)
// validation: evaluate input data and if valid, simply pass it through unchanged; otherwise, throw an exception.

// In both cases, pipes operate on the arguments being processed by a controller route handler.
// Nest interposes a pipe just before a method is invoked, and the pipe receives the arguments destined for the method and operates on them.
// Any transformation or validation operation takes place at that time, after which the route handler is invoked with
// any (potentially) transformed arguments

// Nest comes with a number of build-in pipes that you can use out-of-the-box.
// You can also build your own ucstom pipes.
// In this chapter, we'll introduce the built-in pipes and show how to bind them to route handlers.
// We'll then examine several custom-built pipes to show how you can build one from scratch.

// HINT:
// Pipes run inside the exceptions zone.
// This means that when a Pipe throw an exception it is handled by the exception layer
// (global exceptions filter and any exceptions filter that are applied to the current context).
// Given the above, it should be clear that when exception is thrown in a Pipe,
// no controller method is subsequently executed.
// This gives you a best-practice technique for validating data coming into the application from external sources at the system boundary.

// Built-in Pipes:
// Nest comes with nine pipes available out-of-the-box:
// - ValidationPipe
// - ParseIntPipe
// - ParseFloatPipe
// - ParseBoolPipe
// - ParseArrayPipe
// - ParseUUIDPipe
// - ParseEnumPipe
// - DefaultValuePipe
// - ParseFilePipe

// They're exported from the @nestjs/common package.

// Let's take a quick look aat using ParseIntPipe.
// This is an example of the transformation use case, where the pipe ensurer that a method handler parameter is
// converted to a JavaScript integer (or throws an exception if the conversion fails).
// Later in this capther, we'll show a simple custom implementation for a ParseIntPipe.
// The example techniques below also apply to the other built-in transformation pipes
// (ParseBoolPipe, ParseFloatPipe, ParseEnumPipe, ParseArrayPipe and ParseUUIDPipe, which we'll refer to as the
// Parse* pipes in this capter).

// Binding Pipes:
// To use a pipe, we need to bind an instance of the pipe class to the appropriate context.
// In our ParseIntPipe example, we want to associate the pipe with a particular route handler mthod,
// and make sure it runs before the method is called.
// We do so with the following construct, which we'll refer to as binding the pipe at the method parameter level:

@Controller('cats')
class CatsControllerWithPipe {
  private catsService: {
    findOne: (id: number) => {
      //
    };
  };

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catsService.findOne(id);
  }
}

// This ensures that one of the following two conditions is true:
// either the parameter we receive in the findOne() method is a number (as expected in our call to catsService.findOne())
// or an exception is thrown before the route handler is called.

// For example, assume the route is called like:
// GET localhost:3000/abc
// Nest will thrown an exception like this:
// {"statusCode": 400, "message": "Validation Failed (numeric string is expected)", "error": "Bad Request"}
// The exception will prevent the body of the findOne() method from executing.

// In the example above, we pass a class (ParseIntPipe), not an instance, leaving responsibility for instantiation to
// the framework and enabling dependency injection. As with pipes and guard, we can instead pass an in-place instance.
// Passing an in-place instance is useful if we want to customize the built-in pipe's behavior by passing options:

@Controller('cats')
class CatsControllerWithPipe2 {
  private catsService: {
    findOne: (id: number) => {
      //
    };
  };

  @Get(':id')
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.catsService.findOne(id);
  }
}

// Binding the other transformation pipes(all of the Parse* pipes) works similarly.
// These pipes all work in the context of validating route parameters, query string parameters and request body values.
// For Example with a query string parameter:

@Controller('cats')
class CatsControllerWithPipe3 {
  private catsService: {
    findOne: (id: number) => {
      //
    };
  };

  @Get()
  async findOne(@Query('id', ParseIntPipe) id: number) {
    return this.catsService.findOne(id);
  }
}

// Here's an example of using the ParseUUIDPipe to parse a string parameter and validate if it is a UUID.

@Controller('cats')
class CatsControllerWithPipe4 {
  private catsService: {
    findOne: (uuid: string) => {
      //
    };
  };

  @Get(':uuid')
  async findOne(@Param('uuuid', new ParseUUIDPipe()) uuid: string) {
    return this.catsService.findOne(uuid);
  }
}

// HINT:
// When using ParseUUIDPipe() you are parsing UUID version 3,4, or 5, if you only require a specific version of UUID
// you can pass a version in the pipe options.

// Above we've seen examples of binding the varius Parse* family of built-in pipes.
// Binding validation pipes is a little bit different; we'll discuss that in the following section.

// HINT:
// Also, see Validation Techniques for extensive examples of validation pipes.

// Custom Pipes:
// As mentioned, you can build your own custom pipes.
// While Nest provides a roboust built-in ParseIntPipe and ValidationPipe, let's build simple custom versions
// of each from scratch to see how custom pipes are constructed.

// We start with a simple ValidationPipe.
// Initially, we'll have it simply take an input value and immediately return the same value, behaving like an identity function.

// validation.pipe.ts

// @Injectable()
// export class ValidationPipe implements PipeTransform {
//   transform(value: any, metadata: ArgumentMetadata) {
//     return value;
//   }
// }

// HINT:
// PipeTransform<T, R> is generic interface that must be implemented by any pipe.
// The generic interface uses T to indicate the type of the input value,
// and R to indicate the return type of the transform() metod.

// Every pipe must implement the transform() method to fulfill the PipeTransform interface contract. This method has two parameters:
// - value
// - metadata

// The value parameter is the currently processed method argument (before it is received by the route handling method),
// and metadata is the currently processed method argument's metadata. The metadata object has these properties:

export interface ArgumentMetadata {
  type: 'body' | 'query' | 'param' | 'custom';
  metatype?: Type<unknown>;
  data?: string;
}

// These properties describe the currently processed argument.
// type: Indicates whether the argukment is a body @Body(), query @Query(), param @Param(), or a custom parameter (read more: https://docs.nestjs.com/custom-decorators)
// metatype: Provides the metatype of the argument, for example, String. Note: the value is undefined if you either omit a type
// declaration in the route handler method signature, or use vanilla JavaScript
// data: The string passed to the decorator, for example @Body('string'). It2S undefined if you leave the decorator
// paranthesis empty.

// WARNING:
// TypeScript interfaces disappear during transpilation. Thus, if a method parameter's type is declared as an interface
// instead of class, the metatype value will be object.

// Schema Based Validation:
// Let's make our validation pipe a little more useful.
// Take a closer look at the create() method of the CatsController, where we probably would like to ensure that
// the post body object is valid before attempting to run our service method.

@Controller('cats')
class CatsControllerWithPipe5 {
  private catsService = {
    create: (body: any) => {
      //
    },
  };

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }
}

// Let's focus in on the createCatDto body parameter. Its type is CreateCatDto:

class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

// We want to ensure that any incoming request to the create method contains a valid body.
// So we have to validate the three members of the createCatDto object. We would do this inside the route handler method,
// but doing so is not ideal as it would break the single responsibility rule (SRP).

// Another approach could be to create a validator class and delegate the task there.
// This has the disadvantage that we would have to remember to class this validator at the beginning of each method.

// How about creating validation middleware? This could work, but unfortunately it's not possible to create generic
// middleware which can be used across all contexts acrosss the whole application.
// This is because middleware is unaware of the execution context, including the handler that will be called and any of its parameters.

// This is, of course, exactly the use case for which pipes are designed.
// So let's go ahead and refine our validation pipe.

// Class Validator:
// WARNING: The techniques in this section require TypeScript, and are not available if your app is written using
// vanilla JavaScript.

// Let's look at an alternate implementation for our validation technique.

// Nest works well with the class-validator library.
// This powerful library allows you to use decorater-based validation.
// Decarator-based validation is extremely powerful, especially when comined with Nest's Pipe capabilities since
// we have access to the metatype of the processed property.
// Before we start, we need to install the required packages:

// npm i --save class-validator class-transformer

// Once these are installed, we can add a few decorators to the CreateCatDto class.
// Here we see asignificant advantage of this technique: the CreateCatDto class remains the single source
// of truth for our Post body object (rather than having to create a seperate validation class)

// create-cat.dto.ts

class CreateCatDto2 {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}

// Now we can create a ValidationPipe class that uses these annotations

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException('Validation failed');
    }

    return value;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

// NOTICE:
// Above, we have used the class-transformer library. It's made by the same author as the class-validator library
// and as a result, they play very well together.

// Let's go through this code. First, note that the transform() method is marked as async.
// This is possible because Nest supports both synchronous and asynchoronous pipes.
// We make this method async because some of the class-validator validations can be async(utilize Promises).

// Next note that we are using destructiong to extract the metatype field(extracting just this member from an ArgumentMetadata)
// into our metatype parameter. This is just shorthand for getting the full ArgumentMetadata and then having an
// additional statement to assign the metatype variable.

// Next, note the helper function toValidate(). It's responsible for bypassing the validation step when the current
// argument being processed is a native JavaScript type (these can't have validation decorators attached, so there's
// no reason to run them through the validation step).

// Next, we use the class-transformer function platinToInstance() to transform our plain JavaScript argument
// object into a typed object so that we can apply validation. The reason we must do this is that the incoming
// post body object, when deserialized from the network request, does not have any type information
// (this is the way the underlying platform, such as Express, works).
// Class-validator needs to be use the validation decorators we defined for our DTO earlies,
// so we need to perform this transformation to treat incoming body as an appropriately decorated object,
// not just a plain vanilla object.

// Finally, as noted earlier, since this is a validation pipe it either returns the value unchanged, or throws an exception.

// The last step is to bind the ValidationPiPe.
// Pipes can be parameter-scoped, method-scoped, controller-scoped, or global-scoped.
// Earlier, with our Joi-based validation pipe, we saw an example of binding the pipe at the method level.
// In the example below, we'll bind the pipe instance to the route handler @Body() decorator so that
// our pipe is called to validate the post body.

// cats.controller.ts

@Controller('cats')
class CatsControllerWithPipe6 {
  @Post()
  async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
    //
  }
}

// Parameter-scoped pipes are useful when the validation logic concerns only one specified parameter.

// Global Scoped Pipes:
// Since the ValidationPipe was created to be as generic as possible, we can realize it's full utility by setting up as
// a global-scoped pipe so that is applied to every route handler across the entire application.

// main.ts

async function bootstap4() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}

// NOTICE:
// in the case of hybrid apps the useGlobalPipes() method doesn't set up pipes for gaeways and microservices.
// For "standard" (non-hybrid) microservice apps, useGlobalPipeS() does mount pipes globally.

// Global pipes are used across the whole application, for every controller and every route handler.

// Note that in terms of dependency injection, global pipes registered from outside of any module
// (with useGlobalPipes() as in the example above) cannot inject dependencies since the binding has been done
// outside the context of any module.
// In order to solve this issue, you can set up a global pipe directly from any module using the following construction:

@Module({
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
class AppModuleWithPipe {}

// HINT:
// When using this approach to perform dependency injection for the pipe, note that regardless of the module where
// this construction is employed, the pipe is, in fact, global. Where should this be done?
// Choose the module where the pipe (ValidaitonPipe in the example above) is defined.
// Also, useClass is not the only way of dealing with custom provider registration. Learn more here (https://docs.nestjs.com/fundamentals/custom-providers)

// The built-in ValidationPipe
// As a reminder, you don't have to build a generic validation pipe on your own since the ValidationPipe is provided
// by Nest out-of-the-box. The built-in ValidationPipe offers more options than the sample we built in this chapter,
// which has been kept basic for the sake of illustrating the mechanics of a custom-built pipe. You can find full details
// along with lots of examples here (https://docs.nestjs.com/techniques/validation)

// Transformation use case
// Validation isn't the only case for custom pipes.
// At the beginning of this chapter, we mentioned that a pipe can also transform the input data to the desired format.
// This is possible because the value returned from the transform funciton completly overrides the previous value of the argument.

// When is this usfeul? Consider that sometimes the data passed from the client needs to undergo some change - for example
// converting a string to an ingeter - before it can be properly handled by the route handler method.
// Furthermore, some required data fields may be missing, and we would like to apply default values.
// Transformation pipes can perform these functions by interposing a processing function between the client request
// and the request handler.

// Here's a simple ParseIntPipe which is responsible for parsing a string into an integer value.
// (As noted above, Nest has a built-in ParseIntPipe that is more sophisticated; we include this as a simple example of
// a custom transformation pipe)

// parse-int.pipe.ts

@Injectable()
class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const val = parseInt(value, 10);

    if (isNaN(val)) {
      throw new BadRequestException('Validation failed');
    }
    return val;
  }
}

// We can then bind this pipe to the selected param as shown below:

@Controller('cats')
class CatsControllerWithPipe7 {
  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    return;
  }
}

// Another useful transformation case would be to select an existing user entity from the database using an id supplied in the request:

interface UserEntity {
  id: number;
  name: string;
}

@Injectable()
class UserByIdPipe implements PipeTransform<number, UserEntity> {
  transform(value: number, metadata: ArgumentMetadata): UserEntity {
    const user: UserEntity = {
      id: value,
      name: 'test',
    };

    return user;
  }
}

@Controller('cats')
class CatsControllerWithPipe8 {
  @Get(':id')
  findOne(@Param('id', UserByIdPipe) userEntity: UserEntity) {
    return userEntity;
  }
}

// We leave the implementation of this pipe to the reader, but note that like all other transformation pipes,
// it receives an input value (an id) and returns an output value (a UserEntity Object).
// This can make your code more declarative and DRY by abstracting boilerplate code out of your handler and into a common pipe.

// Providing Defaults

// Parse* pipes expect a parameter's value to be defined. They throw an exception upon receiving null or undefined values.
// To allow an endpoint to handle missing querystring parameter values, we have to provide a default value to be injected
// before the Parse* pipes operate on these values. The DefaultValuePipe serves that purpose.
// Simply instantiate a DefaultValuePipe in the @Query() decorator before the relevant Parse* pipe, as shown below:

@Controller('cats')
class CatsControlerWithPipe8 {
  catsService: any;
  @Get()
  async findAll(
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly: boolean,
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
  ) {
    return this.catsService.findAll({ activeOnly, page });
  }
}
