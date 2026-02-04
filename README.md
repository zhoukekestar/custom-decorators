
# Custom: An Open & Extensible Architecture

  [![npm](https://img.shields.io/npm/v/custom-decorators.svg)](https://www.npmjs.com/package/custom-decorators)
  [![npm](https://img.shields.io/npm/dy/custom-decorators.svg)](https://www.npmjs.com/package/custom-decorators)

  Easily extend and enhance existing methods using standard decorator syntax.

  This library adopts a `Koa-style` middleware pattern to provide a flexible plugin system for your code.

# Quick Start

```js
import custom from 'custom-decorators';

class ClassA {

  // Attach the @custom decorator with a unique identifier
  @custom('ClassA.method')

  // No changes required to the existing method logic
  async method(name) {
    console.log(`hello ${name}`);
  }
}

// Register middleware to extend the method's behavior
custom('ClassA.method', async function(context, next) {

  // Access arguments via the context object
  const { args } = context;

  console.log(this, 'before', args[0]);
  await next();
  console.log(this, 'after', args[0]);
})


const instancea = new ClassA();

// Call the method as usual
instancea.method('world');

/* output
ClassA {} before world
hello world
ClassA {} after world
*/
```

# Architecture

![image](https://github.com/user-attachments/assets/0cba3ba3-87b3-40da-8920-5946584a032c)


# Features

* Seamless Async & Sync Support

The framework automatically detects and supports both synchronous and asynchronous functions based on your implementation.

```js
class ClassA {

  @custom('ClassA.method')
  method(name) {
    console.log(`hello ${name}`);
  }
}

// Note: If the original method is synchronous, the middleware must also be synchronous.
// Do NOT use the `async` keyword in this case.
custom('ClassA.method', function(context, next) {

  const { args } = context;

  console.log(this, 'before', args[0]);
  next();
  console.log(this, 'after', args[0]);
})
```


* Return Value Manipulation

Middleware can capture or even modify the return value of the original method.

```js
class ClassA {

  @custom('ClassA.method')
  async get(name) {
    return `hello ${name}`;
  }
}

// Intercept and modify the return value
custom('ClassA.method', async function(context, next) {

  const returnValue = await next();

  return `before ${returnValue} after`;
})

const instancea = new ClassA();
console.log(instancea.get('world'));

/* output
before hello world after
*/
```


* Private Extensions via Symbols

Ensure your extension points are private and secure by using Symbol instead of string identifiers.

```js
const PRIVATE_EXTENSION = Symbol('private_extension');

class ClassA {

  @custom(PRIVATE_EXTENSION)
  async method(name) {
    console.log(`hello ${name}`);
  }
}

custom(PRIVATE_EXTENSION, async function(context, next) {
  // Your private extension logic here
})
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2024-present, Zhoukekestar
