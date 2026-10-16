import { Outlet, useMatch } from "react-router";
import GeograficoNavbar from "../components/GeograficoNavbar";
import GeograficoFooter from "../components/GeograficoFooter";
import "../styles/pages/consultas-geograficas.scss";

export default function GeograficoLayout() {
    const isDetail = Boolean(useMatch("/geografico/consulta-cep/detalhe"));
    const isWeather = Boolean(useMatch("/geografico/consulta-cptec"));

    return (
        <div className="app-shell geographic-shell" id="topo">
            <GeograficoNavbar detail={isDetail} />
            <Outlet />
            <GeograficoFooter detail={isDetail} weather={isWeather} />
        </div>
    );
}
