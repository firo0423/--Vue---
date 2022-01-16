// 在Vue2 下Get钩子和Set钩子是被添加到各个属性之下的，所以后续设置完属性以后无法再次响应化 -> 对象下加内容无法响应化
// 所以要添加响应属性要使用Vue.set(product, 'name','shoes')  
const depsMap = new Map();

// 追踪key值的变换，每一个key都有一个set来添加更新函数
function track(key) {
  console.log('track触发了');
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  dep.add(effect);
}

// 触发器，用来触发更新函数
function trigger(key) {
  console.log('trigger触发了');
  let dep = depsMap.get(key);
  if (dep) {
    dep.forEach((effect) => {
      effect();
    });
  }
}

// 设置的实例部分
let product = { price: 5, quantity: 2 };
let total = 0;
let effect = () => {
  total = product.price * product.quantity;
};

track("quantity");
effect();

console.log(total);
product.quantity = 3 

trigger("quantity");
console.log(total);