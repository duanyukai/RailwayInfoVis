import React from 'react';
import { Helmet } from 'react-helmet';
import { Switch, Route } from 'react-router-dom';

import MapPage from 'containers/MapPage/Loadable';
import FeaturePage from 'containers/_FeaturePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Header from 'components/Header';
import Footer from 'components/Footer';
import './style.scss';

const App = () => (
  <div className="app-wrapper">
    <Helmet
      titleTemplate="%s - 铁路数据可视化"
      defaultTitle="铁路数据可视化"
    >
      <meta name="description" content="铁路数据可视化大作业" />
    </Helmet>
    <Header />
    <Switch>
      <Route exact path="/" component={MapPage} />
      <Route path="/features" component={FeaturePage} />
      <Route path="" component={NotFoundPage} />
    </Switch>
    <Footer />
  </div>
);

export default App;
