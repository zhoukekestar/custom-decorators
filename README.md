
# custom 开放技术架构

  使用标准的装饰器语法，轻松实现对原有代码的开放、扩展。

  插件的写法，遵循 koa-compose 的中间件写法。

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

* 支持同步

```js
class ClassA {

  @custom('ClassA.method')
  method(name) {
    console.log(`hello ${name}`);
  }
}

// 注意原有函数是同步的，插件函数也需要是同步，不要添加 async 关键字
custom('ClassA.method', function(context, next) {

  const { args } = context;

  console.log(this, 'before', args[0]);
  next();
  console.log(this, 'after', args[0]);
})
```


* 支持返回值

```js
class ClassA {

  @custom('ClassA.method')
  async get(name) {
    return `hello ${name}`;
  }
}

// 支持函数返回
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


* 支持私有扩展 (不对外暴露相关 symbol 对象，即可实现私有扩展)

```js
const PRIVATE_EXTENSION = Symbol('private_extension');

class ClassA {

  @custom(PRIVATE_EXTENSION)
  async method(name) {
    console.log(`hello ${name}`);
  }
}

custom(PRIVATE_EXTENSION, async function(context, next) {
  // code
})
```
