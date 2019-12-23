import cityInfos from '../data/position_old.json';
import info from '../data/info.json'; // {起点站：{到达站：{跳数，价格，时间}}}
import sumInfo from '../data/sumInfo.json'; // {起点站：Set(重点站)}
import { fdeb } from './fdeb';

// dyk 经过bundling的绘制数据
export function findAllConnectionsFDEB() {
  let nodes = {};
  let edges = [];
  // Object.keys(sumInfo).forEach(siteName => {
  //   console.log(siteName);
  // });
  Object.keys(sumInfo).forEach(siteName => {
    // console.log(sumInfo[siteName]);
    // 增加节点
    if (!nodes.hasOwnProperty(siteName)) {
      if (!cityInfos[siteName]) {
        // 找不到坐标，则忽略此站
        console.log('找不到', siteName);  // 找不到遵义西和唐山南，这两个先直接用遵义和唐山代替
      }
      nodes[siteName] = {
        x: (cityInfos[siteName] || '').latitude,  // todo 有的站找不到坐标
        y: (cityInfos[siteName] || '').longitude
      };
    }
    // 增加边
    sumInfo[siteName].forEach(destSiteName => {
      if (!sumInfo.hasOwnProperty(destSiteName)) {
        // 找不到目标车站，先直接不要了
        console.log('找不到目标站', destSiteName);
        return;
      }
      if (edges.hasOwnProperty(destSiteName)) {
        // 如果目标车站已经在nodes列表中了，则删除
        return;
      }
      edges.push({
        source: siteName,
        target: destSiteName
      });
    });
  });

  console.log(nodes, edges);

  // const positions = (fdeb().nodes(nodes).edges(edges.slice(20)))();

  // 测试数据
  var node_data = {
    "0":{"x":922.24444, "y":347.29444},
    "1":{"x":814.42222, "y":409.16111},
    "2":{"x":738, "y":427.33333000000005},
    "3":{"x":784.5, "y":381.33333},
    "4":{"x":1066.09167, "y":350.40278},
    "5":{"x":925.4861099999999, "y":313.275}
  };

  var edge_data = [{"source":"0", "target":"1"}, {"source":"4", "target":"2"}, {"source":"0", "target":"3"}, {"source":"0","target":"4"}, {"source":"2", "target":"5"}, {"source":"3", "target":"2"}, {"source":"3", "target":"4"}];



  // node_data = {
  //   "1": { x: "45.2080", y: "127.961751" },
  //   "2": { x: "36.82981", y: "101.95194" },
  //   "3": { x: "24.99827", y: "109.99898" }
  // };
  //
  // edge_data = [
  //   {
  //     source: "1",
  //     target: "2"
  //   },
  //   {
  //     source: "1",
  //     target: "3"
  //   }
  // ];


  console.log(nodes, edges);

  // let fbundling = fdeb()
  //   .step_size(0.0001)
  //   .compatibility_threshold(0.6)
  //   .nodes(nodes)
  //   .edges(edges.slice(0, 2));

  let fbundling = fdeb()
    .step_size(0.02)
    .compatibility_threshold(0.6)
    .nodes(node_data)
    .edges(edge_data);

  let results = fbundling();
  return results.flatMap(x => x);
}


/**
 *
 * @returns {[]}
 */
export function findAllConnections() {
  const res = [];
  for (const start of Object.keys(sumInfo)) {
    for (const end of sumInfo[start]) {
      res.push([findPosition(start), findPosition(end)]);
    }
  }
  return res;
}

export function findDestinationByScale(startPos, scale, dimension = 'step', res) {
  for (const endPos of Object.keys(info[startPos])) {
    if (info[startPos][endPos][dimension] <= scale && info[startPos][endPos][dimension] !== 0 && !res.has(endPos)) {
      res.add(endPos);
      findDestinationByScale(endPos, scale - info[startPos][endPos][dimension], dimension, res);
    }
  }
  return res;
}

export function findPartialConnections(startPos, scale, dimension = 'step') {
  const des = new Set();
  findDestinationByScale(startPos, scale, dimension, des);
  const res = [];
  for (const endPos of des) {
    res.push([findPosition(startPos), findPosition(endPos)]);
  }
  return res;
}

export function findLayerByScaleBFS(startPos, scale, dimension = 'step') {
  const res = { name: startPos, value: 0, children: [] };
  const set = new Set();
  const queue = new Queue();

  queue.enqueue([res, startPos, 0]);
  set.add(startPos);
  while (!queue.isEmpty()) {
    const v = queue.dequeue();
    const v_tree = v[0]; const v_id = v[1];
    const accumulate_val = v[2];
    // console.log(v_id);
    if (info[v_id] === undefined) continue;
    for (const nextPos of Object.keys(info[v_id])) {
      const value = info[v_id][nextPos][dimension];
      if (value !== 0 && accumulate_val + value <= scale && !set.has(nextPos)) {
        const t_res = { name: nextPos, value: accumulate_val + value, children: [] };
        v_tree.children.push(t_res);
        queue.enqueue([t_res, nextPos, accumulate_val + value]);
        set.add(nextPos);
      }
    }
  }
  return res;
}

export function findLayerByScale(startPos, scale, dimension = 'step', set) {
  const res = {};
  res.name = startPos;
  res.children = [];
  set.add(startPos);
  for (const nextPos of Object.keys(info[startPos])) {
    if (info[startPos][nextPos][dimension] <= scale && info[startPos][nextPos][dimension] !== 0 && !set.has(nextPos)) {
      res.children.push(findLayerByScale(nextPos, scale - info[startPos][nextPos][dimension], dimension, set));
    }
  }
  return res;
}

export function findLayerConnections(startPos, scale, dimension = 'step') {
  const set = new Set();
  return findLayerByScale(startPos, scale, dimension, set);
  // return findLayerByScaleBFS(startPos, scale, dimension);
}

export function findPosition(city) {
  // if (cityInfos.hasOwnProperty(city)) return [parseFloat(cityInfos[city].longitude), parseFloat(cityInfos[city].latitude)];
  // 段段修改，调整经纬度
  if (cityInfos.hasOwnProperty(city)) return [parseFloat(cityInfos[city].latitude), parseFloat(cityInfos[city].longitude)];
  return [-1, -1];
}

export function show(dic) {
  console.log(`{name:${dic.name}`);
  console.log(' children:[');
  for (let i = 0; i < dic.children.length; i++) {
    show(dic.children[i]);
  }
  console.log(']');
  console.log('}\n');
}

function findLayerPositionByScaleAndDepth(startPos, scale, dimension='step', set, list, curDepth, maxDepth){
  set.add(startPos);
  if(curDepth >= maxDepth)
    return;
  if(!list.hasOwnProperty(curDepth))
    list[curDepth] = []
  for(const nextPos of Object.keys(info[startPos])){
    if(info[startPos][nextPos][dimension] <= scale && info[startPos][nextPos][dimension] !== 0 && !set.has(nextPos)){
      list[curDepth].push(findPosition(startPos), findPosition(nextPos));
      findLayerPositionByScaleAndDepth(nextPos, scale - info[startPos][nextPos][dimension], dimension, set, list, curDepth + 1, maxDepth);
    }
  }
}

/**
 * 有层的坐标线
 * @param startPos
 * @param scale
 * @param dimension
 * @param maxDepth
 * @returns {{}}
 */
export function findLayerPositionConnections(startPos, scale, dimension='step', maxDepth = 1000){
  let set = new Set();
  let list = {};
  findLayerPositionByScaleAndDepth(startPos, scale, dimension, set, list, 0, maxDepth);
  return list;
}

export function test() {
  const all = findAllConnections();
  const layer = findLayerConnections('盖州', 200, 'time');
  const parcial = findPartialConnections('盖州', 200, 'time');
  console.log(all);
  console.log(layer);
  console.log(parcial);
}


