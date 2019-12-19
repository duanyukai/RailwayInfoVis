/*const train_ids = require('./train_ids.json')
const train_infos = require('./train_infos.json')
const train_list = require('./train_list.json')*/
const city_infos = require('./position.json');
const info = require('./info.json'); // {起点站：{到达站：{跳数，价格，时间}}}
const sumInfo = require('./sumInfo.json'); // {起点站：Set(重点站)}
/*function init() {
  for (const date of Object.keys(train_list)) {
    for (const type of Object.keys(train_list[date])) {
      const len = train_list[date][type].length;
      for (let idx = 0; idx < len; idx++) {
        let str = train_list[date][type][idx]['station_train_code'].split("(")[1].split(")")[0].split("-");
        let startPos = str[0];
        let endPos = str[1];
        let train_id = train_list[date][type][idx]['train_no'];
        let step = 1;
        let price = 0;
        let time = 0;
        // 维护info信息，info是详细信息
        if (!info.hasOwnProperty(startPos))
          info[startPos] = {};
        if (train_infos.hasOwnProperty(train_id)) {
          const train_info = train_infos[train_id];
          const cnt = train_info.length;
          // 从起点站到当前站
          let passPos = {};
          for (let i = 1; i < cnt; i++) {
            let strTime = train_info[i]["running_time"].split(":");
            time = parseInt(strTime[0]) * 60 + parseInt(strTime[1]);
            let curPos = train_info[i]["station_name"];
            info[startPos][curPos] = { 'step': step, 'price': price, 'time': time };
            // 从一个中途站到另一个中途站
            for (const prePos of Object.keys(passPos)) {
              if (!info.hasOwnProperty(prePos))
                info[prePos] = {};
              info[prePos][curPos] = { 'step': step, 'price': price, 'time': time - passPos[prePos] };
            }
            passPos[curPos] = time;
          }
        } else {
          info[startPos][endPos] = { 'step': step, 'price': price, 'time': time };
        }
        // 维护sumInfo信息，sumInfo是简略信息，只有起止站点信息
        if (!sumInfo.hasOwnProperty(startPos))
          sumInfo[startPos] = new Set();
        sumInfo[startPos].add(endPos);
      }
    }
  }
  //zypang
  //for(const key of Object.keys(sumInfo)){
  //  sumInfo[key]=[...sumInfo[key]];
  //}
}*/

function findAllConnections(){
  let res = [];
  for(const start of Object.keys(sumInfo)){
    for(const end of sumInfo[start]){
      res.push([findPosition(start), findPosition(end)]);
    }
  }
  return res;
}

function findDestinationByScale(startPos, scale, dimension= 'step', res){
  for(const endPos of Object.keys(info[startPos])){
    if(info[startPos][endPos][dimension] <= scale && info[startPos][endPos][dimension] !== 0 && !res.has(endPos)) {
      res.add(endPos);
      findDestinationByScale(endPos, scale - info[startPos][endPos][dimension], dimension, res);
    }
  }
  return res;
}

function findPartialConnections(startPos, scale, dimension= 'step'){
  let des = new Set();
  findDestinationByScale(startPos, scale, dimension, des);
  let res = [];
  for(const endPos of des){
    res.push([findPosition(startPos), findPosition(endPos)]);
  }
  return res;
}

function findLayerByScaleBFS(startPos, scale, dimension='step'){
  let res = {'name':startPos,'children':[]};
  let set=new Set();
  let queue=new Queue();

  queue.enqueue([res,startPos]);
  set.add(startPos);
  while(!queue.isEmpty()){
    let v=queue.dequeue();
    let v_tree=v[0],v_id=v[1];
    //console.log(v_id);
    if(info[v_id]===undefined) continue;
    for(const nextPos of Object.keys(info[v_id])){
      if(info[v_id][nextPos][dimension] <= scale && info[v_id][nextPos][dimension] !== 0 && !set.has(nextPos)){
        let t_res={'name':nextPos,'children':[]};
        v_tree['children'].push(t_res);
        queue.enqueue([t_res,nextPos]);
        set.add(nextPos);
      }
    }
  }
  return res;
}

function findLayerByScale(startPos, scale, dimension='step', set){
  let res = {};
  res['name'] = startPos;
  res['children'] = [];
  set.add(startPos);
  for(const nextPos of Object.keys(info[startPos])){
    if(info[startPos][nextPos][dimension] <= scale && info[startPos][nextPos][dimension] !== 0 && !set.has(nextPos)){
      res['children'].push(findLayerByScale(nextPos, scale - info[startPos][nextPos][dimension], dimension, set));
    }
  }
  return res;
}

function findLayerConnections(startPos, scale, dimension='step'){
  let set = new Set();
  return findLayerByScale(startPos, scale, dimension, set);
  //return findLayerByScaleBFS(startPos, scale, dimension);
}

function findPosition(city){
  if(city_infos.hasOwnProperty(city))
    return [parseFloat(city_infos[city]["longitude"]), parseFloat(city_infos[city]["latitude"])];
  return [-1, -1];
}

function show(dic){
  process.stdout.write('{name:' + dic['name']);
  process.stdout.write(' children:[')
  for(let i = 0; i < dic['children'].length; i++){
    show(dic['children'][i]);
  }
  process.stdout.write("]");
  process.stdout.write("}\n");
}

let all = findAllConnections();
let layer = findLayerConnections('盖州', 200, 'time' );
let parcial = findPartialConnections('盖州', 200, 'time' );
console.log(parcial)
//show(parcial);
