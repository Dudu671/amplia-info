import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { DOMAIN_TYPES, getDomain } from "../services/dominio.js";
import "../styles/pages/consulta-dominio.scss";

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Domínio" },
        {
            name: "description",
            content: "Consulte a disponibilidade de domínios brasileiros.",
        },
    ];
}

export default function ConsultaDominio() {
    const requestRef = useRef(null);
    const [recordType, setRecordType] = useState(".com.br");
    const [domainName, setDomainName] = useState("");
    const [domain, setDomain] = useState(null);
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => {
        requestRef.current?.abort();
        requestRef.current = null;
    }, []);

    function clearQuery() {
        requestRef.current?.abort();
        requestRef.current = null;
        setDomain(null);
        setErrorMessage("");
        setStatus("idle");
    }

    function handleDomainChange(event) {
        clearQuery();
        setDomainName(event.target.value);
    }

    function handleTypeChange(event) {
        clearQuery();
        setRecordType(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (requestRef.current) return;
        const controller = new AbortController();
        requestRef.current = controller;
        setDomain(null);
        setErrorMessage("");
        setStatus("loading");

        try {
            const result = await getDomain(domainName, recordType, controller.signal);
            if (controller.signal.aborted || requestRef.current !== controller) return;
            setDomain(result);
            setStatus("success");
        } catch (error) {
            if (controller.signal.aborted || requestRef.current !== controller || error.name === "AbortError") return;
            setErrorMessage(error.message);
            setStatus("error");
        } finally {
            if (requestRef.current === controller) requestRef.current = null;
        }
    }


    return (
        <main className="domain-page">
            <nav className="breadcrumb container" aria-label="Breadcrumb">
                <span>Você está em:</span>
                <Link to="/">Início</Link>
                <span aria-hidden="true">/</span>
                <Link to="/empresarial">Empresarial</Link>
                <span aria-hidden="true">/</span>
                <strong>Consulta de Domínio</strong>
            </nav>


            <section className="domain-consultation container" aria-labelledby="domain-title">
                <header className="domain-heading">
                    <h1 id="domain-title">
                        Consulta de Disponibilidade de Domínio .br
                    </h1>
                    <p>
                        Consulte o status de registro, o vencimento e os servidores DNS de domínios .br pela BrasilAPI / Registro.br.
                    </p>
                </header>


                <form className="domain-form" onSubmit={handleSubmit} noValidate>
                    <div className="domain-field">
                        <label htmlFor="record-type">Tipo de Registro:</label>
                        <select
                            id="record-type"
                            name="recordType"
                            value={recordType}
                            onChange={handleTypeChange}>
                            {DOMAIN_TYPES.map((type) => (<option key={type} value={type}>
                                {type}
                            </option>
                            ))}
                        </select>
                    </div>


                    <div className="domain-field">
                        <label htmlFor="domain-name">Nome do Domínio:</label>

                        <div className="domain-input">
                            <span className="domain-input__icon" aria-hidden="true">
                                <img src="/assets/consulta-dominio/domain-globe.svg" alt="" />
                            </span>

                            <input
                                id="domain-name"
                                name="domainName"
                                type="text"
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="exemplo-da-empresa"
                                value={domainName}
                                onChange={handleDomainChange}
                                required
                            />
                        </div>
                    </div>


                    <button type="submit" disabled={status === "loading"}>
                        {status === "loading" ? "Consultando domínio..." : "Consultar Domínio"}
                    </button>
                    <div className="domain-form__divider" aria-hidden="true" />

                    <p className="domain-security">
                        <span className="domain-security__icon" aria-hidden="true">
                            <img src="/assets/consulta-cnpj/security-lock.svg" alt="" width="12" height="14" />
                        </span>

                        <span>
                            Ambiente seguro de criptografia ponta a ponta em conformidade com o marco civil da internet.
                        </span>
                    </p>
                </form>

                <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
                    {status === "loading" && "Consultando domínio..."}
                    {status === "success" && `Consulta concluída. Resultado de ${domain.fqdn} disponível abaixo.`}
                </div>
                {status === "error" && <p className="domain-feedback__error" role="alert">{errorMessage}</p>}
                {status === "success" && domain && (
                    <article className="domain-result" aria-labelledby="domain-result-title">
                        <header>
                            <h2 id="domain-result-title">{domain.fqdn}</h2>
                            <p className="domain-result__status">{domain.status}</p>
                        </header>
                        {domain.expiresAt && (
                            <dl className="domain-result__details">
                                <div><dt>Vencimento</dt><dd>{domain.expiresAt}</dd></div>
                            </dl>
                        )}
                        {domain.hosts.length > 0 && (
                            <section aria-labelledby="domain-hosts-title">
                                <h3 id="domain-hosts-title">Servidores DNS</h3>
                                <ul>{domain.hosts.map((host) => <li key={host}>{host}</li>)}</ul>
                            </section>
                        )}
                        {domain.suggestions.length > 0 && (
                            <section aria-labelledby="domain-suggestions-title">
                                <h3 id="domain-suggestions-title">Sugestões da fonte</h3>
                                <ul>{domain.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ul>
                            </section>
                        )}
                        <footer className="domain-result__source">
                            <p><strong>Fonte: BrasilAPI / Registro.br</strong></p>
                            <p>{domain.consultedAt}</p>
                            <p>A situação pode mudar e a consulta não reserva o domínio. A fonte pode fornecer dados em cache.</p>
                        </footer>
                    </article>
                )}
            </section>
        </main>
    );
}
