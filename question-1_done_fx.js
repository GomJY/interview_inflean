const {reduce,filter,map,add,go,pipe,curry, L, take, go1, takeAll, C} = require('./module/fx_my.js');
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
    const parse = data => {
        const err_format = str => {
            if(typeof str === "string" || typeof str === "number" ) {
                return `${str} (에러해결)`
            } else {
                let result = {};
                for(let objName of Object.keys(str)) {
                    result[objName] = str[objName] + " (에러해결)";
                }
                return result;
            }
        };
        //Object, Array안에 Promise객체가 있는지 확인
        const has_promise_in_group = (object) => {
            if(!isObjectArray(object)) { return false; }
            let keyNames = object.constructor === Array  ? new Array(object.length).fill(0).map((v, index) => index)
                                                         : Object.keys(object);
            for(let keyName of keyNames) {
                if(object[keyName] instanceof Promise) { return true;}
            }                    
            return false;
        }
        //Object, Array인지 검사
        const isObjectArray = (data) => data == null || !(data.constructor === Array || data.constructor === Object) ? false : true;
        const obj_to_objArray = object => Object.keys(object).map(v => {let r = {}; r[v] = object[v]; return r;});
        //object를 Array로 번경
        const object_to_array = (object) => Object.keys(object).map(keyName => object[keyName]);
        const get_object_key_value = obj => [Object.keys(obj).shift(), Object.values(obj).shift()];
        const get_promiseValue = data => new Promise(res => {
            let isArray = data instanceof Array;
            return go(
                obj_to_objArray(data),
                map(async a => {
                    let [key, value] =get_object_key_value(a);
                    //value가 Promise인지 확인 후 Promise_then,catch 처리 후 Promise로 반환
                    if(value instanceof Promise) {
                        return new Promise(res => {
                                value.then(async then_1 => has_promise_in_group(then_1) ? // then안에 Promise객체가 있는지 확인
                                        res((a[key] = await get_promiseValue(then_1), a)) : res((a[key] = then_1, a))
                                ).catch(err => (a[key] = `${err} (에러해결)`, res(a)));
                            });
                    //array, Object 인 경우 안에 Promise가 있는지 확인
                    } else if(isObjectArray(value) && has_promise_in_group(value)) {
                        return Promise.resolve((a[key] = await get_promiseValue(value), a));
                    }
                    return a;
                }),
                C.map(a => a),
                reduce((a, b) => (a[get_object_key_value(b)[0]] = get_object_key_value(b)[1], a)),
            ).then(data => {
                res(isArray ? object_to_array(data) : data);
            });
        }); 
        return get_promiseValue(data);
    };
    const Q1 = (data, callback) => {
        const result = parse(data);
        result && result.constructor === Promise ? result.then(callback) : callback(result);
    }; 
    const start = new Date;
    console.log('\n데이터');
    console.log(data);
    console.log('\n기대결과');
    console.log(sample);
    Q1(data, result => {
        console.log(`\n실행결과 ${new Date - start}ms`, JSON.stringify(sample) == JSON.stringify(result));
        console.log(result);
        console.log();
    });
}();