import { useEffect, useRef, useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import ConsultationResult from "../components/ConsultationResult";
import { searchCorretoras } from "../services/corretoras";
import { formatCnpj } from "../utils/format";

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Corretoras" },
        { name: "description", content: "Pesquise corretoras de valores autorizadas pela CVM." },
    ];
}

function brokerDetails(broker) {
    const city = [broker.municipio, broker.uf].filter(Boolean).join("/");
    return [
        { label: "Razão social", value: broker.nome_social },
        { label: "CNPJ", value: broker.cnpj ? formatCnpj(broker.cnpj) : "" },
        { label: "Situação", value: broker.status },
        { label: "Cidade", value: city },
        { label: "Código CVM", value: broker.codigo_cvm },
        { label: "Telefone", value: broker.telefone },
        { label: "E-mail", value: broker.email },
    ];
}

export default function ConsultaCorretoras() {
    const requestRef = useRef(null);
    const [name, setName] = useState("");
    const [results, setResults] = useState(null);
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => requestRef.current?.abort(), []);

    function handleNameChange(event) {
        setName(event.target.value);
        setResults(null);
        setStatus("idle");
        setErrorMessage("");
    }

    async function handleSubmit() {
        const term = name.trim();
        if (term.length < 2) {
            setErrorMessage("Digite pelo menos 2 caracteres do nome da corretora.");
            setStatus("error");
            setResults(null);
            return;
        }

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        setResults(null);
        setErrorMessage("");

        try {
            const data = await searchCorretoras(term, controller.signal);
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
        <ConsultationPage title="Consulta de Corretoras" description="Liste e consulte corretoras de valores autorizadas pela CVM."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Corretoras" }]}>
            <ConsultationForm buttonLabel={status === "loading" ? "Pesquisando..." : "Pesquisar"} onSubmit={handleSubmit} disabled={status === "loading"}>
                <ConsultationField id="broker-name" label="Pesquisar corretora por nome:" icon="/assets/financeiro/building.svg">
                    <input id="broker-name" name="name" type="search" value={name} onChange={handleNameChange}
                        placeholder="Digite o nome da corretora" autoComplete="off" required minLength={2} pattern=".*\S.*" />
                </ConsultationField>
            </ConsultationForm>
            {status !== "idle" && <section className="consultation-results" aria-live="polite" aria-busy={status === "loading"}>
                {status === "loading" && <p className="consultation-status">Pesquisando corretoras...</p>}
                {status === "error" && <p className="consultation-status consultation-status--error" role="alert">{errorMessage}</p>}
                {status === "success" && results.total === 0 && <p className="consultation-status">Nenhuma corretora encontrada para esse nome.</p>}
                {status === "success" && results.total > 0 && (
                    <>
                        <p className="consultation-results__summary">
                            {results.total > results.items.length
                                ? `Mostrando ${results.items.length} de ${results.total} corretoras. Refine a pesquisa para ver outras.`
                                : `Resultados encontrados (${results.total}):`}
                        </p>
                        {results.items.map((broker) => (
                            <ConsultationResult key={broker.cnpj} title={broker.nome_comercial || broker.nome_social}
                                details={brokerDetails(broker)} icon="/assets/financeiro/building.svg" />
                        ))}
                    </>
                )}
            </section>}
        </ConsultationPage>
    );
}
