// es5 原型属性写法

function Num(n){
    this._num = n;
}
Num.prototype = {
    get num() {
        console.log('get');
        return this._num;
    },
    set num(n) {
        console.log(n,"set")
        this._num = n;
    }
}
let nu = new Num(3);
console.log(nu.num,"============")//get
nu.num = 34 //34 set
console.log(nu.num,"------------") //get


// // es5 对象属性写法

// function Num(n){

//     return {
//         get num(){
//             console.log("get")
//             return this._num;
//         },
//         set num(n) {
//             console.log("set",n);
//             this._num = n;
//         }
//     }
// }

// let nu = new Num(3);
// console.log(nu.num,"============")//get undefined ============
// nu.num = 34 //34 set
// console.log(nu.num,"------------") //get 34 ------------