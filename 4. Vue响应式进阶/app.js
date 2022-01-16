// 对于初级阶段的相应式，比如说track依赖里面有多个effect
// 假如我们每次get product.price 都会遍历关于它的所有方法
// 但是我们只想要其中一个方法，这样就会浪费性能，而且每个方法都得写一个effect1，2，3，4太麻烦

// 改进：创建一个 activeEffect 来监视要运行的effect

let activeEffect = null;
function effect(eff) {
  activeEffect = eff;
  // 运行
  activeEffect();
  // 清除 方便后面追踪检测
  activeEffect = null;
}

const targetMap = new WeakMap();
// 追踪key值的变换，每一个key都有一个Set来添加更新函数
// 此Set非彼set 这里的Set是一个集合
function track(target, Key) {
  if (activeEffect) {
    console.log("track触发了");
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }

    let dep = depsMap.get(Key);
    if (!dep) {
      depsMap.set(Key, (dep = new Set()));
    }
    dep.add(activeEffect);
  }
}

// 触发器，用来触发更新函数
function trigger(target, Key) {
  console.log("trigger触发了");
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  let dep = depsMap.get(Key);
  if (dep) {
    dep.forEach((effect) => {
      effect();
    });
  }
}

// 通过es6的新特性proxy和reflect来完成响应式
function VueReactive(target) {
  const handler = {
    get(target, Key, receiver) {
      console.log("GET被调用了 " + Key);
      // do other thing...
      // receiver来表明this指向的对象
      let result = Reflect.get(target, Key, receiver); // 结果
      track(target, Key);
      return result;
    },
    set(target, Key, value, receiver) {
      console.log("SET被调用了 " + Key);
      // do other thing...
      let result = Reflect.set(target, Key, value, receiver); // true
      trigger(target, Key);
      return result;
    },
  };
  // 使用代理来完成对对象的绑定和操作 target就是对象 handler就是操作
  return new Proxy(target, handler);
}

// 设置的实例部分

let product = VueReactive({ price: 5, quantity: 2 });
console.log("---------------------------------------------------------");
let total = 0;

// 业务逻辑部分
// 追踪总销售额
effect(() => {
  // 在这里就调用了两次GET price quantity
  total = product.price * product.quantity;
});

// 设置售卖价格
effect(() => {
  // 在这里就调用了两次GET price quantity
  salePrice = product.price * 0.9;
});

console.log(
  `在更新total之前-应该10 = ${total} 售卖价格-应该4.5 = ${salePrice}`
);
console.log("---------------------------------------------------------");
product.quantity = 3; //SET被调用了 quantity
console.log(
  `在更新total之后-应该15 = ${total} 售卖价格-应该4.5 = ${salePrice}`
);
console.log("---------------------------------------------------------");
product.price = 10; //SET被调用了 quantity
console.log(`在更新total之后-应该30 = ${total} 售卖价格-应该9 = ${salePrice}`);

// ---------------------------------------------------------
// GET被调用了 price
// track触发了
// GET被调用了 quantity
// track触发了
// 上述是第一个方程被调用，在price和quantity中存储了fun1匿名函数
// GET被调用了 price
// track触发了
// 上述是第二个方程被调用，在price中存储了fun2匿名函数
// 在更新total之前-应该10 = 10 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 quantity
// trigger触发了 -> 在这里就完成了 effect的触发 -> activeEffect为null
// 改进的地方 -> activeEffect为null 就没有track遍历
// GET被调用了 price
// GET被调用了 quantity
// 在更新total之后-应该15 = 15 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 price
// trigger触发了
// GET被调用了 price
// GET被调用了 quantity
// GET被调用了 price
// 在更新total之后-应该30 = 30 售卖价格-应该9 = 9

// 原输出
// ---------------------------------------------------------
// GET被调用了 price
// track触发了
// GET被调用了 quantity
// track触发了
// 10
// ---------------------------------------------------------
// SET被调用了 quantity
// trigger触发了
// GET被调用了 price
// track触发了
// GET被调用了 quantity
// track触发了
// 15
