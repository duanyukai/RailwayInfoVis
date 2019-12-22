import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import './style.scss';
import L from 'leaflet';
import {
  findAllConnections,
  findAllConnectionsFDEB,
  findLayerConnections,
  findPartialConnections,
  test,
} from './maputils/maputils';

import cityPositions from './data/position.json';
import { Button, ButtonGroup, Modal } from 'react-bootstrap';

export default class MapPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);

    this.state = {
      curStation: "北京", // 当前站点名称，用于显示
      showZYPModal: false,
      showStationRadius: true, // 配置项，是否显示大小
    };
  }

  componentDidMount() {
    let self = this;
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
    let connections = findAllConnections();
    // let connections = findAllConnectionsFDEB();
    // let connections = findLayerConnections('盖州', 200, 'time');
    // let connections = findPartialConnections('盖州', 200, 'time');
    // console.log('计算完毕');
    console.log(connections);
    // return;

    connections.slice(0, 1).forEach(line => {
      L.polyline(line, {
        pane: 'railway-line-pane',
        opacity: 0.1
      }).addTo(this.lfMap);
    });

    // 绘制所有车站坐标
    console.log('车站数量', Object.keys(cityPositions));
    Object.keys(cityPositions).forEach(stationName => {
      let cityLatLng = [cityPositions[stationName].latitude, cityPositions[stationName].longitude];
      let radius = [0, 5, 5, 4, 3, 2, 1, 1][cityPositions[stationName].level];
      let opacity = [0, 1, 0.9, 0.9, 0.8, 0.8, 0.7, 0.7][cityPositions[stationName].level];
      // console.log(radius);
      let circleMarker = L.circleMarker(cityLatLng, {
        pane: 'station-line-pane',
        radius: radius,
        opacity: opacity,
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

    this.lfMap.on('zoomend', function() {
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
    if (prevState.curStation !== this.state.curStation) {
      // console.log("车站变了");
      // 重新绘制可达信息

    }
  }

  render() {
    const {curStation, showZYPModal} = this.state;
    return (
      <div>
        <Helmet>
          <title>首页 - 铁路信息可视化</title>
          <meta name="description" content="铁路信息可视化" />
        </Helmet>
        <div className="main-wrapper">
          {/*地图图层*/}
          <div className="map-wrapper" ref={m => this.lfMapDOM = m} />
          {/*左侧边栏*/}
          <div className="left-pane">
            <div style={{textAlign:'center', fontSize: 18, fontWeight: 'bold'}}>{curStation}站</div>
            <hr />
            <div style={{textAlign:'center'}}>
              <ButtonGroup>
                <Button variant="secondary">跳数范围</Button>
                <Button variant="secondary">时间范围</Button>
              </ButtonGroup>
            </div>
            <Button onClick={() => this.setState({showZYPModal: true})}>显示zyp图</Button>
          </div>
          {/*右侧边栏*/}
          <div>
            <Modal
              size="lg"
              centered
              show={showZYPModal}
              onHide={() => this.setState({showZYPModal: false})}
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                  Modal heading
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <h4>Centered Modal</h4>
                <p>
                  Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
                  dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
                  consectetur ac, vestibulum at eros.
                </p>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}
