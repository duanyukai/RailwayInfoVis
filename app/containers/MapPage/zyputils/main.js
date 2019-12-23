import info from '../data/info.json';
import sumInfo from '../data/sumInfo.json';
import {findLayerConnections} from '../maputils/maputils';

export function main(data) {
  const layer = findLayerConnections('北京南', 200, 'time');
  console.log(layer);
  treeMap(layer, 'tree_div');
}

Promise.all([
  d3.json('../data/info.json'),
  d3.json('../data/sumInfo.json'),
]).then((data) => main(data)).catch((error) => console.log(error));
