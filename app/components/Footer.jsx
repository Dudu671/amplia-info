import "../styles/components/footer.scss";

const footerLinks = [
  {
    title: "Serviços",
    links: ["Consulta CPF", "Cadastro Empresarial", "Rede de Hospitais"],
  },
  {
    title: "Legislação",
    links: [
      "Constituição Federal",
      "Lei de Acesso à Informação",
      "Privacidade e LGPD",
    ],
  },
  {
    title: "Canais",
    links: ["Fale Conosco", "Ouvidoria Geral", "Redes Sociais Oficiais"],
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
              {links.map((link) => (
                <li key={link}>
                  <a href="#categorias">{link}</a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </footer>
  );
}
