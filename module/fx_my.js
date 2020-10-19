const nop = Symbol('nop');
const curry = f => (a, ..._) => _.length ? f(a, ..._) 
                                         : (..._) => f(a, ..._);

                                        
const filter = curry((f, iter) => {
  let res = [];
  for(let item of iter) {
    if(f(item)) res.push(item); 
  }
  return res;
});

const reduceF = (acc, a, f) => 
  a instanceof Promise ?
    a.then(a => f(acc, a), e => e == nop ? acc : Promise.reject(e)) :
    f(acc, a);
const head = iter => go1(take(1, iter), ([h]) => h);

const reduce = curry((f, acc, iter) => {
  if(!iter) return reduce(f, head(iter = acc[Symbol.iterator]()), iter);
  
  iter = iter[Symbol.iterator]();
  return go1(acc, function recur(acc) {
    let cur;
    while(!(cur = iter.next()).done) {  
      acc = reduceF(acc, cur.value, f);
      if(acc instanceof Promise) return acc.then(recur);
    }
    return acc;
  });
});

const add = (a, b) => a + b;

const go = (...args) => reduce((a, f) => f(a), args);
const pipe = (f, ...fs) => (...as) => go(f(...as), ...fs);


//iter를 받아서 l까지 길이 만큼 꺼내고(Promise인 경우), l이 iter에 크기보다 크다면 iter을 전부 꺼낸다.
const take = curry((l, iter) => {
  let res = [];
  iter = iter[Symbol.iterator]();
  return function recur() {
    let cur;
    while(!(cur = iter.next()).done) {
      const a = cur.value;
      if(a instanceof Promise) {
        return a
        // ** 중요
        .then(a => (res.push(a), res).length == l ? res : recur())
        .catch(e => e == nop ? recur() : Promise.reject(e));
      }
      res.push(a);
      if(res.length == l) return res;
    }
    return res;
  }();
});

const takeAll = take(Infinity);

const range = l => {
  let i = -1;
  let res = [];
  while(++i < l) {
    res.push(i);
  }
  return res;
};
const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);
const L = {};
L.range = function *(l) {
  let i = -1;
  while(++i < l) {
    yield i;
  }
}
L.map = curry(function *(f, iter) {
  for (const a of iter) {
    yield go1(a, f);
  }
});


L.filter = curry(function *(f, iter) {
  for(const a of iter) {
    const b = go1(a, f);
    if(b instanceof Promise) yield b.then(b => b ? a : Promise.reject(nop));
    else if(b) yield a;
  }
});
const C = {};
function noop() {}
const catchNoop = arr => (arr.forEach(a => a instanceof Promise ? a.catch(noop) : a), arr);
C.reduce = curry((f, acc, iter) => {
  return iter ? reduce(f, acc, catchNoop([...iter])) : reduce(f, catchNoop([...acc]));
});

C.take = curry((l, iter) => {
  return take(l, catchNoop([...iter]));
});
C.takeAll = C.take(Infinity);
C.map = curry(pipe(L.map, C.takeAll));
C.filter = curry(pipe(L.filter, C.takeAll));
const map = curry(pipe(L.map, takeAll));

module.exports = {
  reduce,
  filter,
  map,
  range,
  add,
  go,
  pipe,
  curry,
  L,
  go1,
  take,
  takeAll,
  C,
}



