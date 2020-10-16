import React, { Component } from 'react';

import mathLogo from "../src/math-logo.png";

export default class Navbar extends Component {
    render() {
        return (
            <div>
                <nav className="navbar navbar-expand-md navbar-light">
                    <span className="navbar-brand" href="#"><img src={mathLogo}/></span>
                </nav>
            </div>
        )
    }
}
