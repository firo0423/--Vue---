# --Vue---
原视频网址 https://www.vuemastery.com/courses/vue-3-reactivity/ <br>
根据视频学习自己手写Vue响应式原理，中间自己加了点注释看起来也更清晰 <br>
```js
//-----------------------功能触发区-------------------------
// computed 设置
function computed(getter){
    let result = ref()
    console.log('-----------------------------------');
    // result.value为函数return出来的值 并对其响应化
    effect(()=>{result.value = getter()})

    return result 
}

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
// -----------------------设置的实例部分-------------------------
let product = VueReactive({ price: 5, quantity: 2 });
let salePrice = computed(()=>{
    console.log('salePrice computed属性触发');
    return product.price*0.9
})
let total = computed(()=>{
    console.log('total computed属性触发');
    return salePrice.value * product.quantity
})

console.log("---------------------------------------------------------");

console.log(
  `在更新total之前-应该10 = ${total.value} 售卖价格-应该4.5 = ${salePrice.value}`
);
console.log("---------------------------------------------------------");
product.quantity = 3; //SET被调用了 quantity
console.log(
  `在更新total之后-应该13.5 = ${total.value} 售卖价格-应该4.5 = ${salePrice.value}`
);
console.log("---------------------------------------------------------");
product.price = 10; //SET被调用了 price
console.log(
  `在更新total之后-应该27 = ${total.value} 售卖价格-应该9 = ${salePrice.value}`
);

// -----------------------------------
// salePrice computed属性触发
// GET被调用了 price
// track触发了
// ref SET_____________
// trigger触发了
// activeEffect 结束
// -----------------------------------
// total computed属性触发
// ref GET++++++++++++++
// track触发了
// GET被调用了 quantity
// track触发了
// ref SET_____________
// trigger触发了
// activeEffect 结束
// ---------------------------------------------------------
// ref GET++++++++++++++
// ref GET++++++++++++++
// 在更新total之前-应该10 = 9 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 quantity
// trigger触发了
// total computed属性触发
// ref GET++++++++++++++
// GET被调用了 quantity
// ref SET_____________
// trigger触发了
// ref GET++++++++++++++
// ref GET++++++++++++++
// 在更新total之后-应该13.5 = 13.5 售卖价格-应该4.5 = 4.5
// ---------------------------------------------------------
// SET被调用了 price
// trigger触发了
// salePrice computed属性触发
// GET被调用了 price
// ref SET_____________
// trigger触发了
// total computed属性触发
// ref GET++++++++++++++
// GET被调用了 quantity
// ref SET_____________
// trigger触发了
// ref GET++++++++++++++
// ref GET++++++++++++++
// 在更新total之后-应该27 = 27 售卖价格-应该9 = 9
```
