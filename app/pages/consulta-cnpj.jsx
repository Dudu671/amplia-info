import { useState } from "react";
import { Link } from "react-router";
import "../styles/pages/consulta-cnpj.scss";

import states from "../utils/states.json"

// React Router lê este export junto ao componente da rota.
// eslint-disable-next-line react-refresh/only-export-components
export function meta() {
    return [
        { title: "AmpliaInfo — Consulta CNPJ" },
        {
            name: "description",
            content: "Consulte informações cadastrais de empresas pelo CNPJ.",
        },
    ];
}

export default function ConsultaCnpj() {
    const [cnpj, setCnpj] = useState("");
    const [uf, setUf] = useState("");

    function formatCnpj(value) {
        return value
            .replace(/\D/g, "")
            .slice(0, 14)
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2");
    }

    function handleSubmit(event) {
        event.preventDefault();
    }

    return (
        <main className="cnpj-page">
            <nav className="breadcrumb container" aria-label="Breadcrumb">
                <span>Você está em:</span>
                <Link to="/">Início</Link>
                <span aria-hidden="true">/</span>
                <Link to="/empresarial">Empresarial</Link>
                <span aria-hidden="true">/</span>
                <strong>Consulta CNPJ</strong>
            </nav>

            <section
                className="cnpj-consultation container"
                aria-labelledby="cnpj-title"
            >
                <header className="cnpj-heading">
                    <h1 id="cnpj-title">Consulta CNPJ</h1>
                    <p>
                        Localize informações cadastrais de empresas através do número do
                        CNPJ.
                    </p>
                </header>

                <form className="cnpj-form" onSubmit={handleSubmit}>
                    <div className="cnpj-field">
                        <label htmlFor="cnpj">CNPJ</label>
                        <input
                            id="cnpj"
                            name="cnpj"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={18}
                            placeholder="00.000.000/0000-00"
                            value={cnpj}
                            onChange={(event) => setCnpj(formatCnpj(event.target.value))}
                            required
                        />
                    </div>

                    <div className="cnpj-field">
                        <label htmlFor="state">UF da Empresa (Opcional)</label>
                        <select
                            id="state"
                            name="state"
                            className={uf ? "has-value" : undefined}
                            value={uf}
                            onChange={(event) => setUf(event.target.value)}
                        >
                            <option value="" disabled>
                                Selecione o estado
                            </option>
                            {states.map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit">Consultar CNPJ</button>

                    <div className="cnpj-form__divider" aria-hidden="true" />

                    <p className="cnpj-security">
                        <img
                            src="/assets/consulta-cnpj/security-lock.svg"
                            alt=""
                            width="12"
                            height="14"
                        />
                        <span>
                            Ambiente seguro de criptografia ponta a ponta em conformidade com
                            o marco civil da internet e LGPD.
                        </span>
                    </p>
                </form>
            </section>
        </main>
    );
}
