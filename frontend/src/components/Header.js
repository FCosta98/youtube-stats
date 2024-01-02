import React from 'react';
import { Link, NavLink } from 'react-router-dom';

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
        <NavLink to="/analytics" className={({ isActive, isPending }) =>
          isPending ? "nav-link" : isActive ? "nav-link active-link" : "nav-link"
        }>
          Analytics
        </NavLink>
        <NavLink to="/about" className={({ isActive, isPending }) =>
          isPending ? "nav-link" : isActive ? "nav-link active-link" : "nav-link"
        }>
          About us
        </NavLink>
      </div>
    </header>
  );
}