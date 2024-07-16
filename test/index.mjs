import custom from '../index.mjs';
import test from 'node:test';
import assert from 'node:assert';

test('有注解没有任何中间件的情况', async t => {
  class CustomWithNoMiddleware {
    filed = () => 'CustomWithNoMiddleware.field';

    @custom('CustomWithNoMiddleware.asyncFieldMethod')
    asyncFieldMethod = async () => {
      return 'CustomWithNoMiddleware.asyncFieldMethod';
    };

    @custom('CustomWithNoMiddleware.syncFieldMethod')
    syncFieldMethod = () => {
      return 'CustomWithNoMiddleware.syncFieldMethod';
    };

    @custom('CustomWithNoMiddleware.asyncMethod')
    async asyncMethod () {
      return 'CustomWithNoMiddleware.asyncMethod';
    }

    @custom('CustomWithNoMiddleware.syncMethod')
    syncMethod () {
      return 'CustomWithNoMiddleware.syncMethod';
    }

    @custom('CustomWithNoMiddleware.methodargs')
    async methodargs (arg1, arg2) {
      return [arg1, arg2];
    }

    @custom('CustomWithNoMiddleware.methodthis')
    async methodthis () {
      return this;
    }
  }
  const customWithNoMiddleware = new CustomWithNoMiddleware();
  assert.deepEqual(
    customWithNoMiddleware.filed(),
    'CustomWithNoMiddleware.field'
  );
  assert.deepEqual(
    await customWithNoMiddleware.asyncFieldMethod(),
    'CustomWithNoMiddleware.asyncFieldMethod'
  );
  assert.deepEqual(
    customWithNoMiddleware.syncFieldMethod(),
    'CustomWithNoMiddleware.syncFieldMethod'
  );
  assert.deepEqual(
    await customWithNoMiddleware.asyncMethod(),
    'CustomWithNoMiddleware.asyncMethod'
  );
  assert.deepEqual(
    customWithNoMiddleware.syncMethod(),
    'CustomWithNoMiddleware.syncMethod'
  );
  assert.deepEqual(await customWithNoMiddleware.methodargs(1, 2), [1, 2]);
  assert.deepEqual(
    await customWithNoMiddleware.methodthis(),
    customWithNoMiddleware
  );
});

test('有注解且有中间件，但不做任何处理', async t => {
  class CustomWithMiddleware {
    @custom('CustomWithMiddleware.asyncFieldMethod')
    asyncFieldMethod = async () => {
      return 'CustomWithMiddleware.asyncFieldMethod';
    };

    @custom('CustomWithMiddleware.syncFieldMethod')
    syncFieldMethod = () => {
      return 'CustomWithMiddleware.syncFieldMethod';
    };

    @custom('CustomWithMiddleware.asyncMethod')
    async asyncMethod () {
      return 'CustomWithMiddleware.asyncMethod';
    }

    @custom('CustomWithMiddleware.syncMethod')
    syncMethod () {
      return 'CustomWithMiddleware.syncMethod';
    }

    @custom('CustomWithMiddleware.methodargs')
    async methodargs (arg1, arg2) {
      return [arg1, arg2];
    }

    @custom('CustomWithMiddleware.methodthis')
    async methodthis () {
      return this;
    }
  }
  custom('CustomWithMiddleware.asyncFieldMethod', async (context, next) => {
    return await next();
  });

  custom('CustomWithMiddleware.syncFieldMethod', (context, next) => {
    return next();
  });

  custom('CustomWithMiddleware.asyncMethod', async (context, next) => {
    return await next();
  });

  custom('CustomWithMiddleware.syncMethod', (context, next) => {
    return next();
  });

  const customWithMiddleware = new CustomWithMiddleware();
  assert.deepEqual(
    await customWithMiddleware.asyncFieldMethod(),
    'CustomWithMiddleware.asyncFieldMethod'
  );
  assert.deepEqual(
    customWithMiddleware.syncFieldMethod(),
    'CustomWithMiddleware.syncFieldMethod'
  );
  assert.deepEqual(
    await customWithMiddleware.asyncMethod(),
    'CustomWithMiddleware.asyncMethod'
  );
  assert.deepEqual(
    customWithMiddleware.syncMethod(),
    'CustomWithMiddleware.syncMethod'
  );
  assert.deepEqual(await customWithMiddleware.methodargs(1, 2), [1, 2]);
  assert.deepEqual(
    await customWithMiddleware.methodthis(),
    customWithMiddleware
  );
});

test('有注解且有中间件并使用中间件执行结果', async t => {
  class CustomWithMiddlewareExecute {
    filed = () => 'CustomWithMiddlewareExecute.field';

    @custom('CustomWithMiddlewareExecute.asyncFieldMethod')
    asyncFieldMethod = async () => {};

    @custom('CustomWithMiddlewareExecute.syncFieldMethod')
    syncFieldMethod = () => {};

    @custom('CustomWithMiddlewareExecute.asyncMethod')
    async asyncMethod () {}

    @custom('CustomWithMiddlewareExecute.syncMethod')
    syncMethod () {}

    @custom('CustomWithMiddlewareExecute.methodargs')
    async methodargs (arg1, arg2) {}

    @custom('CustomWithMiddlewareExecute.methodthis')
    async methodthis () {}
  }
  custom(
    'CustomWithMiddlewareExecute.asyncFieldMethod',
    async (context, next) => {
      return 'hook';
    }
  );

  custom('CustomWithMiddlewareExecute.syncFieldMethod', (context, next) => {
    return 'hook';
  });

  custom('CustomWithMiddlewareExecute.asyncMethod', async (context, next) => {
    return 'hook';
  });

  custom('CustomWithMiddlewareExecute.syncMethod', (context, next) => {
    return 'hook';
  });

  custom('CustomWithMiddlewareExecute.methodargs', (context, next) => {
    return context.args;
  });
  custom('CustomWithMiddlewareExecute.methodthis', function (context, next) {
    return this;
  });

  const customWithMiddlewareExecute = new CustomWithMiddlewareExecute();
  assert.deepEqual(
    customWithMiddlewareExecute.filed(),
    'CustomWithMiddlewareExecute.field'
  );
  assert.deepEqual(
    await customWithMiddlewareExecute.asyncFieldMethod(),
    'hook'
  );
  assert.deepEqual(customWithMiddlewareExecute.syncFieldMethod(), 'hook');
  assert.deepEqual(await customWithMiddlewareExecute.asyncMethod(), 'hook');
  assert.deepEqual(customWithMiddlewareExecute.syncMethod(), 'hook');
  assert.deepEqual(await customWithMiddlewareExecute.methodargs(1, 2), [1, 2]);
  assert.deepEqual(
    await customWithMiddlewareExecute.methodthis(),
    customWithMiddlewareExecute
  );
});

test('多层中间件测试', async t => {
  class MultipleMiddle {
    @custom('MultipleMiddle.asyncMethod')
    asyncMethod (arg1) {
      return arg1 + '-core';
    }

    @custom('MultipleMiddle.syncMethod')
    syncMethod (arg1) {
      return arg1 + '-core';
    }
  }

  custom('MultipleMiddle.asyncMethod', async (context, next) => {
    if (context.args[0] === '1') {
      return 'hook-1';
    }
    return await next();
  });

  custom('MultipleMiddle.asyncMethod', async (context, next) => {
    if (context.args[0] === '2') {
      return 'hook-2';
    }
    return await next();
  });

  custom('MultipleMiddle.syncMethod', (context, next) => {
    if (context.args[0] === '1') {
      return 'hook-1';
    }
    return next();
  });

  custom('MultipleMiddle.syncMethod', (context, next) => {
    if (context.args[0] === '2') {
      return 'hook-2';
    }
    return next();
  });

  const multipleMiddle = new MultipleMiddle();
  assert.deepEqual(await multipleMiddle.asyncMethod('0'), '0-core');
  assert.deepEqual(await multipleMiddle.asyncMethod('1'), 'hook-1');
  assert.deepEqual(await multipleMiddle.asyncMethod('2'), 'hook-2');
  assert.deepEqual(multipleMiddle.syncMethod('0'), '0-core');
  assert.deepEqual(multipleMiddle.syncMethod('1'), 'hook-1');
  assert.deepEqual(multipleMiddle.syncMethod('2'), 'hook-2');
});



test('多层中间件 return 值测试', async t => {
  class MultipleMiddle {
    @custom('MultipleMiddle.asyncMethod')
    asyncMethod (arg1) {
      return 'core';
    }
  }

  custom('MultipleMiddle.asyncMethod', async (context, next) => {
    let val = '1-'
    val = val + await next();
    return val + '-1';
  });

  custom('MultipleMiddle.asyncMethod', async (context, next) => {
    let val = '2-'
    val = val + await next();
    return val + '-2';
  });



  const multipleMiddle = new MultipleMiddle();
  assert.deepEqual(await multipleMiddle.asyncMethod(), '2-1-core-1-2');

});
