function promiseTest() {
  const result = [1, 2, ,3 ,4, 5];
  for(let i=0; i < 100; i++) {
    if(i == 99) {
      return new Promise(res => res(result));
    }
  }
}

async function syncTest() {
  await promiseTest().then(data => {
    console.log(data);
  });
  console.log("syncTest END");
}
syncTest();
console.log("END");

if(data.constructor == Object) {
  const first = objName;
  result.hasOwnProperty[objName] ? "" : result[first] = {};
  for(let in_obj_name in then_1) {
      if(then_1[in_obj_name].constructor === Promise) {
          sync_fn.push(new Promise((res) => {
              then_1[in_obj_name].then((then_2) => {
                  result[first][in_obj_name] = then_2;
                  console.log(result[first]);
              }).catch((err_2) => {
                  result[first][in_obj_name] = err_format(err_2);
              }).finally(() => {res();});
          }));
      } else {
          result[first][in_obj_name] = then_1[in_obj_name];
      }
  }
} else {
  result[objName] = then_1;
}

const data = {
  boo: true, str: '',
  obj: { num: 1, obj: { k: 'obj in obj' }, arr: ['arr in obj'] },
  arr: ['str in arr', { k: 'obj in arr', und: undefined }, ['arr in arr']],
  pro_nul: pro_res(null), pro_num: pro_rej(-1), pro_obj: pro_res({ k: 'pro_obj' }),
  pro_arr: pro_res(['str in pro_arr', { k: 'obj in pro_arr' }, ['arr in pro_arr']]),
  pro_in_obj: pro_res({ und: pro_res(undefined), str: pro_rej('str') }),
  pro_in_arr: ['str in arr', pro_res({ k: 'obj in arr', err: pro_rej('err1') }), ['arr in arr', pro_rej('err2')]],
};