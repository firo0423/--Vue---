const depsMap = new Map();

// 追踪key值的变换，每一个key都有一个Set来添加更新函数
// 此Set非彼set 这里的Set是一个集合
function track(Key) {
  console.log('track触发了');
  let dep = depsMap.get(Key);
  if (!dep) {
    depsMap.set(Key, (dep = new Set()));
  }
  dep.add(effect);
}

// 触发器，用来触发更新函数
function trigger(Key) {
  console.log('trigger触发了');
  let dep = depsMap.get(Key);
  if (dep) {
    dep.forEach((effect) => {
      effect();
    });
  }
}

// 通过es6的新特性proxy和reflect来完成响应式
function VueReactive(target){
    const handler = {
        get(target, Key, receiver) {
            console.log("GET被调用了 " + Key);
            // do other thing...
            // receiver来表明this指向的对象
            let result = Reflect.get(target, Key, receiver); // 结果
            track(Key)
            return result
          },
          set(target, Key, value, receiver) {
            console.log("SET被调用了 " + Key);
            // do other thing...
            let result = Reflect.set(target, Key, value, receiver); // true
            trigger(Key)
            return result
          },
    }
    // 使用代理来完成对对象的绑定和操作 target就是对象 handler就是操作
    return new Proxy(target,handler)
}

// 设置的实例部分

let product = VueReactive({ price: 5, quantity: 2 });
console.log('---------------------------------------------------------');
let total = 0;

// 业务逻辑部分
let effect = () => {
    // 在这里就调用了两次GET price quantity
  total = product.price * product.quantity;
};

effect();
console.log(total);
console.log('---------------------------------------------------------');
product.quantity = 3  //SET被调用了 quantity
console.log(total);

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