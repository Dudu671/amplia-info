import { NavLink } from "react-router";
import Navbar from "./Navbar";
import FavIcon from "../../public/favicon.svg?react";

export default function GeograficoNavbar({ detail = false }) {
    if (!detail) return <Navbar />;

    return (
        <header className="site-header site-header--cep-detail">
            <nav className="navbar container" aria-label="Navegação principal">
                <NavLink className="brand" to="/" end aria-label="AmpliaInfo - Início">
                    <FavIcon />
                    <span>Amplia <span>Info</span></span>
                </NavLink>
                <p className="cep-header-status">Prévia do layout <span aria-hidden="true" /></p>
            </nav>
        </header>
    );
}
