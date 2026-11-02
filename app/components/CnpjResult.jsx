function SectionIcon({ name }) {
    const paths = {
        company: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v3h4v-3" /></>,
        address: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
        contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
        classification: <><path d="m12 3 8 4v6c0 4-8 8-8 8s-8-4-8-8V7l8-4Z" /><path d="m8 12 3 3 5-6" /></>,
        refresh: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /><path d="M12 7v5l3 2" /></>,
    };
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function CnpjResult({ company, onRefresh }) {
    return (
        <article className="cnpj-result" aria-labelledby="cnpj-company-name">
            <header className="cnpj-result__identity">
                <span className="cnpj-result__avatar" aria-hidden="true">
                    <img src="/assets/financeiro/building.svg" alt="" width="44" height="44" />
                </span>
                <div className="cnpj-result__identification">
                    <div className="cnpj-result__title">
                        <h2 id="cnpj-company-name">{company.name}</h2>
                        <span className={`cnpj-result__badge${company.status === "Ativa" ? " cnpj-result__badge--active" : ""}`}>
                            {company.status}
                        </span>
                    </div>
                    <p>CNPJ: {company.formattedCnpj}</p>
                </div>
            </header>

            {company.sections.map(({ title, icon, details }) => (
                <section className="cnpj-result__section" key={title} aria-labelledby={`cnpj-section-${icon}`}>
                    <header>
                        <SectionIcon name={icon} />
                        <h3 id={`cnpj-section-${icon}`}>{title}</h3>
                    </header>
                    <dl>
                        {details.map(({ label, value }) => (
                            <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            ))}

            <footer className="cnpj-result__source">
                <span className="cnpj-result__source-icon"><SectionIcon name="refresh" /></span>
                <div>
                    <p className="cnpj-result__source-title">Fonte: BrasilAPI / Minha Receita</p>
                    <p>{company.consultedAt}</p>
                </div>
                <button type="button" onClick={onRefresh}>Atualizar dados</button>
            </footer>
        </article>
    );
}
