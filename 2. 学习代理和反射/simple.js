const obj = {};

const handler = {
  get(target, propKey, receiver) {
    console.log("GET " + propKey);
    // do other thing...
    // 使用reflect 去‘映射原有属性’-get的 也就是说在这里触发get
    // 能够让get、set继续执行它之前应该执行的行为。
    // 1 通过对set、get函数的代理，我们可以对访问不存在的对象属性进行单独的处理。
    
    return Reflect.get(target, propKey, receiver);
    
    // 这相当于自己去重构obj有的属性 但是get其实并没有触发 被handle拦截了
    // return obj
  },
  set(target, propKey, value, receiver) {
    console.log("SET " + propKey);
    // do other thing...

    return Reflect.set(target, propKey, value, receiver);
    // 这相当于自己去重构obj有的属性 自己当set
    // obj[propKey] = value
    // console.log(obj);
    // return obj
  },
};

const objP = new Proxy(obj, handler);
objP.hello = "hello";

console.log(objP.hello);
