import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import './style.scss';
import L from 'leaflet';

export default class MapPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    this.lfMap = L.map(this.lfMapDOM, {
      // maxZoom: 2, // todo
      // minZoom: 5,
      // crs: L.CRS.Simple,
      // zoomControl: false,
      // attributionControl: false,
      // detectRetina: true,
      // fadeAnimation: false
      tileSize: 512
    });
    this.lfMap.setView([51.505, -0.09], 3);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiZHVhbnl1a2FpIiwiYSI6ImNqMG9vbmc1bjAwZmwzMnFhZHAzMDBsMnAifQ.GyWGmW1En47Mvq3mbRmljg'
    }).addTo(this.lfMap);
  }

  render() {
    const {
      loading, error, repos, username, onChangeUsername, onSubmitForm
    } = this.props;

    return (
      <div>
        <Helmet>
          <title>首页 - 铁路信息可视化</title>
          <meta name="description" content="铁路信息可视化" />
        </Helmet>
        <div className="map-wrapper" ref={m => this.lfMapDOM = m} />
      </div>
    );
  }
}

MapPage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func
};
