import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import GeograficoNotice from "../components/GeograficoNotice";
import Dropdown from "../components/Dropdown";
import useCities from "../hooks/useCities";
import { formatAddressLine, searchEnderecos } from "../services/cep";
import states from "../utils/states.json";
import { normalizeText } from "../utils/text";

const assets = "/assets/geografico/consultas";

export function meta() {
    return [
        { title: "AmpliaInfo — Busca de CEP" },
        { name: "description", content: "Busca de CEP por estado, cidade e logradouro." },
    ];
}

export default function ConsultaCep() {
    const { state: savedSearch } = useLocation();
    const requestRef = useRef(null);
    const [filters, setFilters] = useState(savedSearch?.filters ?? { state: "", city: "", street: "" });
    const { cities, status: cityStatus } = useCities(filters.state);
    const [results, setResults] = useState(savedSearch?.results ?? null);
    const [limited, setLimited] = useState(savedSearch?.limited ?? false);
    const [status, setStatus] = useState(savedSearch?.results ? "success" : "idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => requestRef.current?.abort(), []);

    function clearResults() {
        requestRef.current?.abort();
        setResults(null);
        setLimited(false);
        setStatus("idle");
        setErrorMessage("");
    }

    function handleStateChange(state) {
        if (state === filters.state) return;
        setFilters((current) => ({ ...current, state, city: "" }));
        clearResults();
    }

    function handleCityChange(city) {
        setFilters((current) => ({ ...current, city }));
        clearResults();
    }

    function handleStreetChange(event) {
        setFilters((current) => ({ ...current, street: event.target.value }));
        if (status !== "idle") clearResults();
    }

    async function handleSubmit() {
        if (!filters.state || !filters.city) {
            setErrorMessage("Selecione o estado e a cidade para continuar.");
            setStatus("error");
            setResults(null);
            return;
        }
        if (normalizeText(filters.street).length < 3) {
            setErrorMessage("Digite pelo menos 3 letras do logradouro.");
            setStatus("error");
            setResults(null);
            return;
        }

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        setErrorMessage("");
        setResults(null);

        try {
            const data = await searchEnderecos(filters.state, filters.city, filters.street, controller.signal);
            if (controller.signal.aborted) return;
            setResults(data.addresses);
            setLimited(data.limited);
            setStatus("success");
        } catch (error) {
            if (error.name === "AbortError" || controller.signal.aborted) return;
            setErrorMessage(error.message);
            setStatus("error");
        }
    }

    function getCityPlaceholder() {
        if (cityStatus === "loading") return "Carregando cidades...";
        if (cityStatus === "error") return "Não foi possível carregar cidades";
        return "Selecione a cidade";
    }

    const searchState = { filters, results, limited };

    return (
        <div className="geographic-consultation geographic-consultation--cep">
            <ConsultationPage
                title="Busca de CEP por Endereço"
                description="Localize códigos postais através da seleção de estado, cidade e logradouro."
                breadcrumbs={[{ label: "Geográfico", to: "/geografico" }, { label: "Busca de CEP" }]}>
                <ConsultationForm buttonLabel={status === "loading" ? "Buscando..." : "Buscar CEP"} onSubmit={handleSubmit} disabled={status === "loading"}>
                    <ConsultationField id="cep-state" label="Estado (UF):">
                        <Dropdown id="cep-state" name="state" value={filters.state} options={states} placeholder="Selecione o estado"
                            onChange={handleStateChange} />
                    </ConsultationField>
                    <ConsultationField id="cep-city" label="Cidade:">
                        <Dropdown id="cep-city" name="city" value={filters.city} options={cities} placeholder={getCityPlaceholder()}
                            disabled={!filters.state || cityStatus !== "success" || !cities.length}
                            onChange={handleCityChange} />
                    </ConsultationField>
                    <ConsultationField id="cep-street" label="Logradouro:" icon={`${assets}/address.svg`}>
                        <input id="cep-street" name="street" value={filters.street} placeholder="Digite o nome da rua" required minLength={3} pattern=".*\S.*"
                            onChange={handleStreetChange} />
                    </ConsultationField>
                    {cityStatus === "error" && <GeograficoNotice role="alert">Não foi possível carregar as cidades. Selecione outro estado e tente novamente.</GeograficoNotice>}
                    {status === "error" && <GeograficoNotice role="alert">{errorMessage}</GeograficoNotice>}
                </ConsultationForm>
                {status === "success" && results?.length === 0 && (
                    <p className="consultation-status" role="status">Nenhum CEP encontrado para esse logradouro.</p>
                )}
                {status === "success" && results?.length > 0 && (
                    <section className="cep-results" aria-labelledby="cep-results-title">
                        <h2 id="cep-results-title">{results.length} {results.length === 1 ? "endereço encontrado" : "endereços encontrados"}</h2>
                        {limited && <p>A busca retorna no máximo 50 endereços. Refine o logradouro se o CEP não aparecer.</p>}
                        <ul>
                            {results.map((address) => (
                                <li key={address.cep}>
                                    <Link to="/geografico/consulta-cep/detalhe" state={{ ...searchState, address }}>
                                        <strong>{address.cep}</strong>
                                        <span>{formatAddressLine(address)}</span>
                                        <span className="cep-results__action">Ver detalhes →</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </ConsultationPage>
        </div>
    );
}
