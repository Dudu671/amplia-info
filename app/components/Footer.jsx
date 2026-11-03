import { Link } from "react-router";
import "../styles/components/footer.scss";

const footerLinks = [
  {
    title: "Serviços",
    links: [
      { label: "Consulta CNPJ", to: "/empresarial/consulta-cnpj" },
      { label: "Cadastro Empresarial", to: "/empresarial" },
      { label: "Rede de Hospitais", to: "/saude/hospitais" },
      { label: "Geográfico", to: "/geografico" },
    ],
  },
  {
    title: "Legislação",
    links: [
      {
        label: "Constituição Federal",
        href: "https://www4.planalto.gov.br/legislacao/portal-legis/legislacao-1/constituicao",
      },
      {
        label: "Lei de Acesso à Informação",
        href: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm",
      },
      {
        label: "Privacidade e LGPD",
        href: "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <section className="footer-brand" aria-label="Sobre a AmpliaInfo">
          <h2>AmpliaInfo</h2>
          <p>
            Portal oficial de informações públicas e serviços federais
            unificados da República Federativa do Brasil.
          </p>
        </section>
        {footerLinks.map(({ title, links }) => (
          <section className="footer-links" key={title}>
            <h2>{title}</h2>
            <ul>
              {links.map(({ label, to, href }) => (
                <li key={label}>
                  {to ? <Link to={to}>{label}</Link> : <a href={href}>{label}</a>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </footer>
  );
}
