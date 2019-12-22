const cityLevel = require('./city_level.json');
const cityPos = require('../position_old.json');

let res = {};
Object.keys(cityPos).forEach(stationName => {
  // 根据名单判断车站等级，城市等级从1到5，其余的标记为6
  let level = 6;
  for (let i = 1; i <= 5; i++) {
    if (cityLevel[i].includes(stationName)) {
      level = i;
      break;
    }
  }
  res[stationName] = {
    latitude: +parseFloat(cityPos[stationName].latitude).toFixed(13),
    longitude: +parseFloat(cityPos[stationName].longitude).toFixed(13),
    level,
    isMain: true
  };
});

// 判断每一个车站，若其去掉末尾的“东西南北”字样仍然存在，则标记为同城次级站点，同时设置等级
Object.keys(res).forEach(stationName => {
  let parentName = stationName.replace(/(南|北|东|西)$/, '');
  if (res.hasOwnProperty(parentName) && stationName.match(/..(南|北|东|西)$/)) {
    res[stationName] = {
      ...res[stationName],
      level: res[parentName].level,
      isMain: false
    };
  }
});

console.log(JSON.stringify(res, null, 4));
