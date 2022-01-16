// 对于上个版本，我们成功的完成了多个effect功能的添加 和 对 trace 的功能优化
// 在这一部分，考虑salePrice = product.price * 0.9; 让salePrice变成响应式-学习ref

//-----------------------功能触发区-------------------------
let activeEffect = null;
function effect(eff) {
  activeEffect = eff;
  // 运行
  activeEffect();
  // 清除 方便后面追踪检测
  activeEffect = null;
  console.log("activeEffect 结束");
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

// -----------------------响应式区域-------------------------
// ref 接收一个值并返回一个响应的可变的ref对象
function ref(raw) {
  // r 为raw也没有任何影响
  const r = {
    get value() {
      console.log("ref GET++++++++++++++");
      track(r, "value");
      return raw;
    },
    set value(newVal) {
      console.log("ref SET_____________");
    //   if (raw === newVal) return;
      raw = newVal;
      trigger(r, "value");
    },
  };
  return r;
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
let salePrice = ref(0);
let total = 0;

console.log("---------------------------------------------------------");
// 业务逻辑部分
// 追踪总销售额

// 设置售卖价格
effect(() => {
  console.log("第一个effect触发了11111111111");
  // 在这里对ref里的value进行赋值
  salePrice.value = product.price * 0.9;
});

effect(() => {
  console.log("第二个effect触发了22222222222");
  // 在这里就调用了两次GET price quantity
  total = salePrice.value * product.quantity;
});

console.log(
  `在更新total之前-应该10 = ${total} 售卖价格-应该4.5 = ${salePrice.value}`
);
console.log("---------------------------------------------------------");
product.quantity = 3; //SET被调用了 quantity
console.log(
  `在更新total之后-应该13.5 = ${total} 售卖价格-应该4.5 = ${salePrice.value}`
);
console.log("---------------------------------------------------------");
product.price = 10; //SET被调用了 price
console.log(
  `在更新total之后-应该27 = ${total} 售卖价格-应该9 = ${salePrice.value}`
);

// 正确顺序 先price
// ---------------------------------------------------------
// 第一个effect触发了11111111111
// GET被调用了 price
// track触发了
// ref SET_____________
// trigger触发了
// activeEffect 结束
// 第二个effect触发了22222222222
// ref GET++++++++++++++
// track触发了
// GET被调用了 quantity
// track触发了
// activeEffect 结束
// ref GET++++++++++++++
// 在更新total之前-应该10 = 9 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 quantity
// trigger触发了
// 第二个effect触发了22222222222
// ref GET++++++++++++++
// GET被调用了 quantity
// ref GET++++++++++++++
// 在更新total之后-应该13.5 = 13.5 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 price
// trigger触发了
// 第一个effect触发了11111111111
// GET被调用了 price
// ref SET_____________
// trigger触发了
// 第二个effect触发了22222222222
// ref GET++++++++++++++
// GET被调用了 quantity
// ref GET++++++++++++++
// 在更新total之后-应该27 = 27 售卖价格-应该9 = 9






// 注意这里的effect顺序换了后 文字也要换 就是第一和第二effect
// 错误顺序 先total
// ---------------------------------------------------------
// 第一个effect触发了1111111111
// ref GET++++++++++++++
// track触发了
// GET被调用了 quantity
// track触发了
// activeEffect 结束
// 第二个effect触发了2222222222
// GET被调用了 price
// track触发了

// -> salePrice.value = product.price * 0.9;
// ref SET_____________
// trigger触发了
// 第一个effect触发了1111111111
// ref GET++++++++++++++

// track触发了
// GET被调用了 quantity
// track触发了
// 第二个effect触发了2222222222
// GET被调用了 price
// track触发了
// ref SET_____________
// activeEffect 结束
// ref GET++++++++++++++
// 在更新total之前-应该10 = 9 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 quantity
// trigger触发了
// 第一个effect触发了1111111111
// ref GET++++++++++++++
// GET被调用了 quantity
// 第二个effect触发了2222222222
// GET被调用了 price
// ref SET_____________
// ref GET++++++++++++++
// 在更新total之后-应该13.5 = 13.5 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 price
// trigger触发了
// 第二个effect触发了2222222222
// GET被调用了 price
// ref SET_____________
// trigger触发了
// 第一个effect触发了1111111111
// ref GET++++++++++++++
// GET被调用了 quantity
// 第二个effect触发了2222222222
// GET被调用了 price
// ref SET_____________
// ref GET++++++++++++++
// 在更新total之后-应该27 = 27 售卖价格-应该9 = 9

