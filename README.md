
# custom 开放技术架构

  使用标准的装饰器语法，轻松实现对原有代码的开放、扩展。

  插件的写法，遵循 koa-compose 的中间件写法。

# Quick Start

```js
import custom from 'custom-decorators';

class ClassA {

  @custom('ClassA.method')
  method(name) {
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

