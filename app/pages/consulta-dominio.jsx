import { useState } from "react";
import { Link } from "react-router";
import "../styles/pages/consulta-dominio.scss";

const domainTypes = [".com.br", ".net.br", ".org.br"];

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
    const [recordType, setRecordType] = useState(".com.br");

    const [domainName, setDomainName] = useState("");

    function handleDomainChange(event) {
        const formattedDomain = event.target.value
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-{2,}/g, "-")
            .slice(0, 63);

        setDomainName(formattedDomain);
    }

    function handleSubmit(event) {
        event.preventDefault();
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
                        Verifique a titularidade e informações de registro de domínios na base do Registro.br
                    </p>
                </header>


                <form className="domain-form" onSubmit={handleSubmit}>
                    <div className="domain-field">
                        <label htmlFor="record-type">Tipo de Registro:</label>
                        <select
                            id="record-type"
                            name="recordType"
                            value={recordType}
                            onChange={(event) => setRecordType(event.target.value)}>
                            {domainTypes.map((type) => (<option key={type} value={type}>
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
                                placeholder="exemplo-da-empresa"
                                maxLength={63}
                                pattern="[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?"
                                value={domainName}
                                onChange={handleDomainChange}
                                required
                            />
                        </div>
                    </div>


                    <button type="submit">Consultar Domínio</button>
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
            </section>
        </main>
    )
}
