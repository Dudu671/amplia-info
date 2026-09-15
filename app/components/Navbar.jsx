import { NavLink } from "react-router";
import "../styles/components/navbar.scss";

import FavIcon from "../../public/favicon.svg?react";

export default function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Navegação principal">
        <NavLink className="brand" to="/" end aria-label="AmpliaInfo - Início">
          <FavIcon />
          <span>
            Amplia <span>Info</span>
          </span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" end>
            Início
          </NavLink>
          <NavLink to="/financeiro">Financeiro</NavLink>
        </div>
      </nav>
    </header>
  );
}
