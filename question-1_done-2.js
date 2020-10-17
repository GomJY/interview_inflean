const { go1 } = require("../../myFunctionalJavascript/module");

/**
 * 1.
 * data 객체는
 * Boolean, null, undefined, Number, String 등의 기본자료형을 값으로 갖거나, (data 의 첫번째 줄)
 * 기본자료형을 값으로 갖는 또다른 객체, 혹은 이들로 이루어진 배열을 값으로 갖습니다. (data 의 두번째 세번째 줄)
 * (객체와 배열은 상호간에 중첩 가능. 즉, 객체의 값에 객체 혹은 배열이 올 수 있고, 배열 안에 객체 혹은 배열이 올 수 있음)
 *
 * 또한 data 객체의 값들은 Promise 객체 형태일 수 있고, (data 의 네번째, 다섯번째 줄)
 * 객체 혹은 배열 내부에서도 Promise 객체 형태가 중첩될 수 있습니다. (data 의 여섯번째, 일곱번째 줄)
 *
 * data 객체에 Promise 객체 형태의 값이 있을 경우
 * Promise 의 이행 결과값 (실패시 발생된 err 로부터 `${err} (에러해결)` 스트링으로 변환 ) 으로 변환시켜주는 함수 parse 를 실행하여,
 * 변환된 데이터로 callback 함수를 실행하는 Q1 의 실행 결과가 sample 과 동일한 결과를 갖도록 parse 함수를 정의해주세요.
 */
!function() {
    const pro_res = v => new Promise((res) => setTimeout(res, 1000, v));
    const pro_rej = v => new Promise((res, rej) => setTimeout(rej, 1000, v));
    const data = {
        boo: true, str: '',
        obj: { num: 1, obj: { k: 'obj in obj' }, arr: ['arr in obj'] },
        arr: ['str in arr', { k: 'obj in arr', und: undefined }, ['arr in arr']],

        pro_nul: pro_res(null), pro_num: pro_rej(-1), pro_obj: pro_res({ k: 'pro_obj' }),
        pro_arr: pro_res(['str in pro_arr', { k: 'obj in pro_arr' }, ['arr in pro_arr']]),
        
        pro_in_obj: pro_res({ und: pro_res(undefined), str: pro_rej('str') }),
        
        pro_in_arr: ['str in arr', pro_res({ k: 'obj in arr', err: pro_rej('err1') }), ['arr in arr', pro_rej('err2')]],

        // pro_in_obj_in_obj: pro_res({ a: pro_res({a_1: pro_res(1), a_2: pro_rej(2)}), b: pro_rej({b_1: 1, b_2: 2}) }),
    };
    const sample = {
        boo: true, str: '',
        obj: { num: 1, obj: { k: 'obj in obj' }, arr: ['arr in obj'] },
        arr: ['str in arr', { k: 'obj in arr', und: undefined }, ['arr in arr']],
        pro_nul: null, pro_num: '-1 (에러해결)', pro_obj: { k: 'pro_obj' },
        pro_arr: ['str in pro_arr', { k: 'obj in pro_arr' }, ['arr in pro_arr']],
        pro_in_obj: { und: undefined, str: 'str (에러해결)' },
        pro_in_arr: ['str in arr', { k: 'obj in arr', err: 'err1 (에러해결)' }, ['arr in arr', 'err2 (에러해결)']]
    };
    /**
     * 이곳이 문제입니다.
     * parse 함수를 수정하여,
     * data 를 사용하여 아래 Q1 함수에서 실행되는 callback 함수의 result 값이
     * 기대결과(sample)로 나오도록 작성해주세요.
     * @param data
     * @returns {*} data 에 포함된 Promise 값들이 모두 resolve 혹은 reject 된 결과값으로 변환된 데이터 셋
     */
    const parse = async data => {
        const log = console.log;
        const curry = f => (a, ..._) => _.length ? f(a, ..._) : (..._) => f(a, ..._);
        const reduce = curry((f, acc, iter) => {
            if(!iter) {
                iter = acc[Symbol.iterator]();
                acc = iter.next().value;
            } else {
                iter = iter[Symbol.iterator]();
            }
            return go1(acc, function recur(acc) {
                let cur;
                while(!(cur = iter.next()).done) {
                    const a = cur.value;
                    acc = f(acc, a);
                    if(acc instanceof Promise) return acc.then(recur);
                }
                return acc;
            });
        });
        const go = (...args) => reduce((a, f) => f(a), args);
        const go1 = (a, f) => a instanceof Promise ? a.then(f) : f(a);
        const map = curry((f, iter) => { 
            let res = [];
            for(const p of iter) {
                res.push(f(p));
            }
            return res;
        });
        const obj_to_objArray = object => Object.keys(object).map(v => {let r = {}; r[v] = object[v]; return r;});
        let me = go(
            obj_to_objArray(data),
            await map(async a => {
                if(Object.values(a).shift() instanceof Promise) {
                    let my = await new Promise(res => {
                        let result = {};
                        Object.values(a).shift().then(then_1 => {
                            result[Object.keys(a).shift()] = then_1;
                            res(result);   
                        }).catch(err => {
                            result[Object.keys(a).shift()] = `${err} (에러해결)`;
                            res(result);
                        });
                    });
                    console.log("Promise", my);
                    return my;
                }
                console.log(a);
                return a;
            })
        );
        log(me);
        log();
    };
    const Q1 = (data, callback) => {
        const result = parse(data);
        result && result.constructor === Promise ? result.then(callback) : callback(result);
    }; 
    const start = new Date;
    // console.log('\n데이터');
    // console.log(data);
    // console.log('\n기대결과');
    // console.log(sample);
    Q1(data, result => {
        console.log(`\n실행결과 ${new Date - start}ms`, JSON.stringify(sample) == JSON.stringify(result));
        console.log(result);
        console.log();
    });
}();