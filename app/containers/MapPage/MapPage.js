import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import './style.scss';
import L from 'leaflet';
import {
  Button, ButtonGroup, FormControl, InputGroup, Modal, Table
} from 'react-bootstrap';
import {
  findAllConnections,
  findAllConnectionsFDEB,
  findLayerConnections, findLayerPositionConnections,
  findPartialConnections,
  test,
} from './maputils/maputils';

import cityPositions from './data/position.json';
import { treeMap } from './zyputils/treemap';
import { radial_tree } from './zyputils/tidy_tree';

export default class MapPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      curStation: '北京', // 当前站点名称，用于显示
      curShowType: 'time', // 当前显示的路线类别
      curMapType: 'radial', // 当前右侧面板显示类型
      curShowLimit: '200', // 当前选择站点的限制（时间、跳数）
      showStationRadius: true, // 配置项，是否显示大小
      isRightPanelLarge: false // 右侧面板大小展开控制
    };
  }

  componentDidMount() {
    const self = this;
    this.lfMap = L.map(this.lfMapDOM, {
      // maxZoom: 2, // todo
      // minZoom: 5,
      // crs: L.CRS.Simple,
      // zoomControl: false,
      // attributionControl: false,
      // detectRetina: true,
      // fadeAnimation: false
      tileSize: 512,
      preferCanvas: true // 使用canvas提高性能
    });
    // 设置地图中心
    this.lfMap.setView([34.3416, 108.9398], 5);

    // 初始化线路用的pane
    this.lfMap.createPane('railway-line-pane');
    this.lfMap.getPane('railway-line-pane').style.zIndex = 450;

    // 初始化车站用的pane
    this.lfMap.createPane('station-line-pane');
    this.lfMap.getPane('station-line-pane').style.zIndex = 550;

    // 中国地图tile图层
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiZHVhbnl1a2FpIiwiYSI6ImNqMG9vbmc1bjAwZmwzMnFhZHAzMDBsMnAifQ.GyWGmW1En47Mvq3mbRmljg'
    }).addTo(this.lfMap);

    // 测试绘制所有线段
    const connections = findAllConnections();
    // let connections = findAllConnectionsFDEB();
    // let connections = findLayerConnections('盖州', 200, 'time');
    // let connections = findPartialConnections('盖州', 200, 'time');
    // console.log('计算完毕');
    console.log(connections);
    // return;

    connections.slice(0, 1).forEach((line) => {
      L.polyline(line, {
        pane: 'railway-line-pane',
        opacity: 0.1
      }).addTo(this.lfMap);
    });

    // 绘制所有车站坐标
    console.log('车站数量', Object.keys(cityPositions));
    Object.keys(cityPositions).forEach((stationName) => {
      const cityLatLng = [cityPositions[stationName].latitude, cityPositions[stationName].longitude];
      const radius = [0, 5, 5, 4, 3, 2, 1, 1][cityPositions[stationName].level];
      const opacity = [0, 1, 0.9, 0.9, 0.8, 0.8, 0.7, 0.7][cityPositions[stationName].level];
      const color = ['', '#00aa00', '#00aa00', '#00cc00', '#66cc66', '#66dd66', '#88dd88', '#88ee88'][cityPositions[stationName].level];
      // console.log(radius);
      const circleMarker = L.circleMarker(cityLatLng, {
        pane: 'station-line-pane',
        radius,
        opacity,
        color: '#00aa00'
      });
      circleMarker.stationName = stationName; // 绑定城市数据
      circleMarker.addTo(this.lfMap).on('click', (e) => {
        // 鼠标点击车站事件
        console.log(e.target);
        self.setState({
          curStation: e.target.stationName
        });
      });
    });

    this.lfMap.on('zoomend', () => {
      console.log('缩放级别', self.lfMap.getZoom());
      // 默认缩放级别5，仅显示12线城市，6到以上显示所有城市
      // if (map.getZoom() < 7){
      //   map.removeLayer(shelterMarkers);
      // }
      // else {
      //   map.addLayer(shelterMarkers);
      // }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // state更新时，对地图进行对应的重绘
    if (prevState.curStation !== this.state.curStation || prevState.curMapType !== this.state.curMapType) {
      // console.log("车站变了");
      // 重新绘制可达信息
      // 删除旧图层
      let connections = findPartialConnections(this.state.curStation, this.state.curShowLimit, this.state.curShowType);  // 坐标对
      console.log(connections);
      // 重新绘制新图层
      if (this.lineLayer)
        this.lfMap.removeLayer(this.lineLayer);

      let lines = connections.map(latlng => {
        return L.polyline(latlng, {
          pane: 'railway-line-pane',
          opacity: 1
        }).addTo(this.lfMap);
      });
      console.log('画的线', lines);
      this.lineLayer = L.layerGroup(lines);
      this.lfMap.addLayer(this.lineLayer);

      // 重新绘制tree map和radial map todo
      const layer = findLayerConnections(this.state.curStation, 200, 'time');
      // treeMap(layer, 'tree_div');

      if (this.state.curMapType === 'radial') {
        radial_tree(layer, 'tree_div');
      } else {
        treeMap(layer, 'tree_div');
      }
    }
  }

  render() {
    const self = this;
    const {
      curStation, curShowType, curShowLimit, curMapType, isRightPanelLarge
    } = this.state;
    return (
      <div>
        <Helmet>
          <title>首页 - 铁路信息可视化</title>
          <meta name="description" content="铁路信息可视化" />
        </Helmet>
        <div className="main-wrapper">
          {/* 地图图层 */}
          <div className="map-wrapper" ref={(m) => this.lfMapDOM = m} />
          {/* 左侧边栏 */}
          <div className="left-pane">
            <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>{curStation}站</div>
            <hr />
            <div style={{ textAlign: 'center' }}>
              <ButtonGroup>
                <Button
                  variant={curShowType === 'hop' ? 'secondary' : 'outline-secondary'}
                  onClick={() => this.setState({ curShowType: 'hop' })}
                >
                  跳数范围
                </Button>
                <Button
                  variant={curShowType === 'time' ? 'secondary' : 'outline-secondary'}
                  onClick={() => this.setState({ curShowType: 'time' })}
                >
                  时间范围
                </Button>
              </ButtonGroup>
              <InputGroup className="mb-3" style={{ marginTop: 3 }}>
                <FormControl
                  placeholder=""
                  value={this.state.curShowLimit}
                  onChange={(e) => this.setState({curShowLimit: e.target.value})}
                />
                <InputGroup.Append>
                  <InputGroup.Text id="basic-addon2">{{ hop: '跳', time: '分钟' }[curShowType]}</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </div>
            <hr />
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>可达目的车站</th>
                  <th>车次</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {/*<tr>*/}
                {/*  <td>沈阳站</td>*/}
                {/*  <td>G237</td>*/}
                {/*  <td>235min</td>*/}
                {/*</tr>*/}
              </tbody>
            </Table>
          </div>
          {/* 右侧边栏 */}
          <div className={`right-pane${isRightPanelLarge ? ' right-pane-large' : ''}`}>
            <Button
              onClick={() => this.setState({ isRightPanelLarge: !isRightPanelLarge })}
            >
              {isRightPanelLarge ? '↘' : '↖'}
            </Button>{' '}
            <ButtonGroup>
              <Button
                variant={curMapType === 'radial' ? 'secondary' : 'outline-secondary'}
                onClick={() => this.setState({ curMapType: 'radial' })}
              >
                  RadialMap
              </Button>
              <Button
                variant={curMapType === 'tree' ? 'secondary' : 'outline-secondary'}
                onClick={() => this.setState({ curMapType: 'tree' })}
              >
                  TreeMap
              </Button>
            </ButtonGroup>
            <div id="tree_div" />
            <div className="tooltip" />
          </div>
        </div>
      </div>
    );
  }
}
