const train_ids = require('./train_ids.json')
const train_infos = require('./train_infos.json')
const train_list = require('./train_list.json')
info = {}
for(const date in train_list){
  for(const type in train_list[date]) {
    const len = train_list[date][type].length;
    for(let idx = 0; idx < len; idx++) {
      let str = train_list[date][type][idx]['station_train_code'].split("(")[1].split(")")[0].split("-");
      if(!info.hasOwnProperty(str[0]))
        info[str[0]] = {};
      info[str[0]][str[1]] = {'step':1, 'price':0, 'time': 0};
      if(!info.hasOwnProperty(str[1]))
        info[str[1]] = {};
      info[str[1]][str[0]] = {'step':1, 'price':0, 'time': 0};
    }
  }
}

function findAllConnections(){
  let res = [];
  for(const start in info){
    for(const end in info[start]){
      res.push([start, end]);
    }
  }
  return res;
}

function findDestinationByScale(startPos, scale, dimension= 'step'){
  let res = [startPos];
  for(const endPos in info[startPos]){
    if(info[startPos][endPos][dimension] <= scale) {
      res.push(endPos);
      res = res.concat(findDestinationByScale(endPos, scale - info[startPos][endPos][dimension], dimension));
    }
  }
  return res;
}

function findPartialConnections(startPos, scale, dimension= 'step'){
  let des = findDestinationByScale(startPos, scale, dimension);
  let temp = new Set(des);
  let res = [];
  for(const endPos of temp){
    res.push([startPos, endPos]);
  }
  return res;
}
let allConnection = findAllConnections();
let destination = findPartialConnections('宜昌东', 3);
console.log(destination);


