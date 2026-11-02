import { useEffect, useRef, useState } from "react";
import Breadcrumb from "../components/Breadcrumb";
import ConsultationField from "../components/ConsultationField";
import CnpjResult from "../components/CnpjResult";
import { getCompany } from "../services/cnpj.js";
import "../styles/pages/consulta-cnpj.scss";

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta CNPJ" },
        { name: "description", content: "Consulte informações cadastrais de empresas pelo CNPJ." },
    ];
}

export default function ConsultaCnpj() {
    const requestRef = useRef(null);
    const [cnpj, setCnpj] = useState("");
    const [company, setCompany] = useState(null);
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => {
        requestRef.current?.abort();
        requestRef.current = null;
    }, []);

    function handleChange(event) {
        requestRef.current?.abort();
        requestRef.current = null;
        setCnpj(event.target.value);
        setCompany(null);
        setErrorMessage("");
        setStatus("idle");
    }

    async function consult(value) {
        if (requestRef.current) return;
        const controller = new AbortController();
        requestRef.current = controller;
        setCompany(null);
        setErrorMessage("");
        setStatus("loading");

        try {
            const result = await getCompany(value, controller.signal);
            if (controller.signal.aborted || requestRef.current !== controller) return;
            setCompany(result);
            setStatus("success");
        } catch (error) {
            if (controller.signal.aborted || requestRef.current !== controller || error.name === "AbortError") return;
            setErrorMessage(error.message);
            setStatus("error");
        } finally {
            if (requestRef.current === controller) requestRef.current = null;
        }
    }

    function handleSubmit(event) {
        event.preventDefault();
        void consult(cnpj);
    }

    return (
        <main className="cnpj-page">
            <Breadcrumb items={[{ label: "Empresarial", to: "/empresarial" }, { label: "Consulta CNPJ" }]} />
            <section className="cnpj-consultation container" aria-labelledby="cnpj-title">
                <header className="cnpj-heading">
                    <h1 id="cnpj-title">Consulta CNPJ</h1>
                    <p>Localize informações cadastrais de empresas através do CNPJ.</p>
                </header>

                <form className="cnpj-form" onSubmit={handleSubmit} noValidate>
                    <ConsultationField id="cnpj" label="CNPJ">
                        <input id="cnpj" name="cnpj" type="text" inputMode="text" autoComplete="off"
                            autoCapitalize="characters" spellCheck={false} placeholder="00.000.000/0000-00"
                            value={cnpj} onChange={handleChange} aria-describedby="cnpj-help" required />
                        <p id="cnpj-help" className="cnpj-form__help">Informe os 14 caracteres, com ou sem pontuação. Letras também são aceitas.</p>
                    </ConsultationField>
                    <button type="submit" disabled={status === "loading"}>
                        {status === "loading" ? "Consultando CNPJ..." : "Consultar CNPJ"}
                    </button>
                    <div className="cnpj-form__divider" aria-hidden="true" />
                    <p className="cnpj-security">
                        <img src="/assets/consulta-cnpj/security-lock.svg" alt="" width="12" height="14" />
                        <span>Ambiente seguro de criptografia ponta a ponta em conformidade com o marco civil da internet e LGPD.</span>
                    </p>
                </form>

                <div className={status === "success" ? "visually-hidden" : "cnpj-feedback"} role="status" aria-live="polite" aria-atomic="true">
                    {status === "loading" && <p className="cnpj-feedback__loading"><span aria-hidden="true" />Consultando CNPJ...</p>}
                    {status === "success" && <p className="visually-hidden">Consulta concluída. Dados de {company.name} disponíveis abaixo.</p>}
                </div>
                {status === "error" && <p className="cnpj-feedback__error" role="alert">{errorMessage}</p>}
                {status === "success" && company && <CnpjResult company={company} onRefresh={() => void consult(company.cnpj)} />}
            </section>
        </main>
    );
}
