import { useEffect, useRef, useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import BankResult from "../components/BankResult";
import { searchBancos } from "../services/bancos";

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Bancos" },
        { name: "description", content: "Consulte bancos, códigos de compensação e instituições financeiras." },
    ];
}

export default function ConsultaBancos() {
    const requestRef = useRef(null);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => requestRef.current?.abort(), []);

    function handleQueryChange(event) {
        setQuery(event.target.value);
        setResults(null);
        setStatus("idle");
        setErrorMessage("");
    }

    async function handleSubmit() {
        const term = query.trim();
        if (!term) return;

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        setResults(null);
        setErrorMessage("");

        try {
            const data = await searchBancos(term, controller.signal);
            if (controller.signal.aborted) return;
            setResults(data);
            setStatus("success");
        } catch (error) {
            if (error.name === "AbortError" || controller.signal.aborted) return;
            setErrorMessage(error.message);
            setStatus("error");
        }
    }

    return (
        <ConsultationPage title="Consulta de Bancos" description="Consulte a lista de bancos e instituições financeiras autorizadas pelo Banco Central."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Bancos" }]}>
            <ConsultationForm buttonLabel={status === "loading" ? "Pesquisando..." : "Pesquisar"} onSubmit={handleSubmit} disabled={status === "loading"}>
                <ConsultationField id="bank-query" label="Pesquisar banco por nome ou código:" icon="/assets/financeiro/bank.svg">
                    <input id="bank-query" name="query" type="search" value={query} onChange={handleQueryChange}
                        placeholder="Digite o nome ou código do banco" autoComplete="off" required pattern=".*\S.*" />
                </ConsultationField>
            </ConsultationForm>
            {status !== "idle" && <section className="consultation-results" aria-live="polite" aria-busy={status === "loading"}>
                {status === "loading" && <p className="consultation-status">Pesquisando bancos...</p>}
                {status === "error" && <p className="consultation-status consultation-status--error" role="alert">{errorMessage}</p>}
                {status === "success" && results.total === 0 && <p className="consultation-status">Nenhum banco encontrado para essa pesquisa.</p>}
                {status === "success" && results.total > 0 && (
                    <>
                        <p className="consultation-results__summary">
                            {results.total > results.items.length
                                ? `Mostrando ${results.items.length} de ${results.total} bancos. Refine a pesquisa para ver outros.`
                                : `Resultados encontrados (${results.total}):`}
                        </p>
                        {results.items.map((bank) => <BankResult key={bank.ispb ?? `${bank.code}-${bank.name}`} bank={bank} />)}
                    </>
                )}
            </section>}
        </ConsultationPage>
    );
}
