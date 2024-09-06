
# custom Open Technical Architecture

  Easily extend and enhance existing code using a standard decorator syntax.

  The extension plugin is written following the style of Koa Middleware.

# Quick Start

```js
import custom from 'custom-decorators';

class ClassA {

  @custom('ClassA.method')
  async method(name) {
    console.log(`hello ${name}`);
  }
}

custom('ClassA.method', async function(context, next) {

  const { args } = context;

  console.log(this, 'before', args[0]);
  await next();
  console.log(this, 'after', args[0]);
})


const instancea = new ClassA();
instancea.method('world');

/* output
ClassA {} before world
hello world
ClassA {} after world
*/
```

# Features

* Support both `async` and `sync` functions depending on your declaration.

```js
class ClassA {

  @custom('ClassA.method')
  method(name) {
    console.log(`hello ${name}`);
  }
}

// Note that the original function is synchronous, so the plugin function should also be sync.
// DO NOT add the `async` keyword.
custom('ClassA.method', function(context, next) {

  const { args } = context;

  console.log(this, 'before', args[0]);
  next();
  console.log(this, 'after', args[0]);
})
```


* Support the return value.

```js
class ClassA {

  @custom('ClassA.method')
  async get(name) {
    return `hello ${name}`;
  }
}

// Get & modify the return value
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


* Support for private extension (by not exports your symbol objects)
  
```js
const PRIVATE_EXTENSION = Symbol('private_extension');

class ClassA {

  @custom(PRIVATE_EXTENSION)
  async method(name) {
    console.log(`hello ${name}`);
  }
}

custom(PRIVATE_EXTENSION, async function(context, next) {
  // code gos here
})
```
