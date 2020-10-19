import React, { Component } from 'react';

import logo from "../src/logo.png";

export default class Navbar extends Component {
    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-md navbar-light">
                    <span className="navbar-brand" href="#"><img src={logo}/></span>
                </nav>
            </div>
        )
    }
}
