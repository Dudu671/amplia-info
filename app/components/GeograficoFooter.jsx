import { Link } from "react-router";
import Footer from "./Footer";
import "../styles/components/geografico-footer.scss";

const assets = "/assets/geografico/consultas";
const detailBrand = {
    title: "Sobre a Consulta",
    description: "Fornecemos acesso rápido e simplificado aos dados de endereçamento postal de todo o território brasileiro, utilizando as bases de dados mais atualizadas disponíveis.",
};
const detailSections = [{
    title: "Links Úteis",
    links: [
        { label: "Como funciona", to: "/geografico/consulta-cep" },
        { label: "API para desenvolvedores" },
        { label: "Termos de uso" },
        { label: "Geográfico", to: "/geografico" },
    ],
}];

export default function GeograficoFooter({ detail = false, weather = false }) {
    if (detail) {
        return (
            <footer className="site-footer geographic-footer geographic-footer--detail">
                <div className="container footer-content">
                    <section className="footer-brand">
                        <h2>{detailBrand.title}</h2>
                        <p>{detailBrand.description}</p>
                    </section>
                    {detailSections.map(({ title, links }) => (
                        <section className="footer-links" key={title}>
                            <h2>{title}</h2>
                            <ul>
                                {links.map(({ label, to }) => (
                                    <li key={label}>{to ? <Link to={to}>{label}</Link> : <span>{label}</span>}</li>
                                ))}
                            </ul>
                        </section>
                    ))}
                    <div className="geographic-footer__social">
                        <div>
                            <span aria-label="LinkedIn"><img src={`${assets}/linkedin.svg`} alt="" /></span>
                            <span aria-label="GitHub"><img src={`${assets}/github.svg`} alt="" /></span>
                        </div>
                        <a href="#topo"><img src={`${assets}/top.svg`} alt="" />Topo da página</a>
                    </div>
                </div>
                <div className="geographic-footer__legal">
                    <span>© 2024 Consulta CEP. Todos os direitos reservados.</span>
                    <div><span>Privacidade</span><span>Cookies</span></div>
                </div>
            </footer>
        );
    }

    return (
        <div className={`geographic-footer${weather ? " geographic-footer--weather" : ""}`}>
            <Footer />
            <div className="geographic-footer__bottom container">
                <div className="geographic-footer__divider" aria-hidden="true" />
                <div className="geographic-footer__disclaimer">
                    <p>Serviço não vinculado ao Governo Federal — dados consultados via APIs públicas</p>
                    <div><span>Acessibilidade</span><Link to="/#categorias">Mapa do site</Link></div>
                </div>
            </div>
        </div>
    );
}
