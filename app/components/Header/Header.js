import React from 'react';
import { Link } from 'react-router-dom';
import Banner from './images/banner.jpg';
import './style.scss';
import { Nav, Navbar } from 'react-bootstrap';

class Header extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div className="header">
        <Navbar bg="dark" variant="dark" fixed="top">
          <Navbar.Brand href="#home">铁路信息可视化</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">地图</Nav.Link>
            <Nav.Link href="#pricing">关于</Nav.Link>
          </Nav>
        </Navbar>
      </div>
    );
  }
}

export default Header;
