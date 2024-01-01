import React from 'react';
import { Link } from 'react-router-dom';

import '../css/Header.css';

export default function Header() {

    return (
        <header className="top-header">
          <div className="title-section">
            <Link to="/" className="title-link">
              What's your YouTube count?
            </Link>
          </div>
          <div className="right-section">
            <Link to="/analytics" className="nav-link">
              Analytics
            </Link>
            <Link to="/about" className="nav-link">
              About us
            </Link>
          </div>
        </header>
      );
}