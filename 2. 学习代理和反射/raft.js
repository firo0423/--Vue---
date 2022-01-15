let a = 1;
// new String(a).a = 1



// a.__proto__.a = 1
console.log(a.__proto__);// 没有autobox 转化 就是原始属性上的__proto__肯定屁都没有 a.__proto__={}
console.info(a.a, a.toString()); // 这里才使用了 相当于new Number(1).toString()
console.log('--------------------------------------------');
let b = new Number(2)
console.log(b);
// console.info(new Number(b).toString());

//[[Prototype]]: Number原始属性了
// new Number(b).__proto__.abc = 1
// new Number(b).__proto__为object原型 也就是空对象
console.log(b.prototype);

