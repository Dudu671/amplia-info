import { useEffect, useState, useSyncExternalStore } from "react";
import { Link } from "react-router";
import Dropdown from "../components/Dropdown";
import HospitalCard from "../components/HospitalCard";
import { createHospitalSearch } from "../services/hospitais-search.js";
import { getCitiesByState } from "../services/cidades";
import states from "../utils/states.json";
import "../styles/pages/hospitais.scss";

const statusMessages = {
    idle: "Use os filtros acima para pesquisar hospitais.",
    loading: "Pesquisando hospitais...",
    success: "Nenhum hospital encontrado para os filtros informados.",
};

export function meta() {
    return [
        { title: "AmpliaInfo — Hospitais" },
        { name: "description", content: "Pesquise hospitais e unidades de atendimento." },
    ];
}

export default function Hospitais() {
    const [filters, setFilters] = useState({ name: "", state: "", city: "" });
    const [cities, setCities] = useState([]);
    const [cityStatus, setCityStatus] = useState("idle");
    const [search] = useState(() => createHospitalSearch());
    const { items: hospitals, status, error: errorMessage, nextCursor, indexDate, loadingMore } = useSyncExternalStore(search.subscribe, search.getSnapshot, search.getSnapshot);

    useEffect(() => () => search.cancel(), [search]);

    useEffect(() => {
        if (!filters.state) return;

        const controller = new AbortController();

        async function loadCities() {
            try {
                const results = await getCitiesByState(filters.state, controller.signal);
                if (controller.signal.aborted) return;
                setCities(results.map((city) => ({ ...city, value: String(city.id) })));
                setCityStatus("success");
            } catch (error) {
                if (controller.signal.aborted || error.name === "AbortError") return;
                setCities([]);
                setCityStatus("error");
            }
        }

        loadCities();
        return () => controller.abort();
    }, [filters.state]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
    }

    function handleStateChange(state) {
        if (state === filters.state) return;
        setCities([]);
        setCityStatus(state ? "loading" : "idle");
        setFilters((currentFilters) => ({ ...currentFilters, state, city: "" }));
    }

    function handleCityChange(city) {
        setFilters((currentFilters) => ({ ...currentFilters, city }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (status === "loading") return;
        search.submit(filters);
    }

    function getCityPlaceholder() {
        if (!filters.state) return "Selecione primeiro o estado";
        if (cityStatus === "loading") return "Carregando cidades...";
        if (cityStatus === "error") return "Erro ao carregar cidades";
        return "Selecione uma cidade";
    }

    return (
        <main className="hospitais-page">
            <nav className="hospitais-breadcrumb container" aria-label="Breadcrumb">
                <span>Você está em:</span>
                <Link to="/">Início</Link>
                <span aria-hidden="true">/</span>
                <Link to="/saude">Saúde</Link>
                <span aria-hidden="true">/</span>
                <strong>Hospitais</strong>
            </nav>

            <section className="hospitais-content container" aria-labelledby="hospitais-title">
                <header className="hospitais-heading">
                    <h1 id="hospitais-title">Pesquisa de Rede de Hospitais</h1>
                    <p>Consulte hospitais, postos de saúde e UPAs cadastrados no CNES.</p>
                </header>

                <form className="hospitais-filters" onSubmit={handleSubmit}>
                    <div className="hospitais-field hospitais-field--name">
                        <label htmlFor="hospital-name">Nome do Hospital</label>
                        <input id="hospital-name" name="name" type="search" value={filters.name} onChange={handleChange} placeholder="Digite palavras-chave..." />
                    </div>

                    <div className="hospitais-field">
                        <label htmlFor="hospital-state">Estado</label>
                        <Dropdown id="hospital-state" name="state" value={filters.state} options={states} placeholder="Selecione um estado" onChange={handleStateChange} />
                    </div>

                    <div className="hospitais-field">
                        <label htmlFor="hospital-city">Cidade</label>
                        <Dropdown id="hospital-city" name="city" value={filters.city} options={cities} placeholder={getCityPlaceholder()} disabled={!filters.state || cityStatus !== "success" || cities.length === 0} onChange={handleCityChange} />
                    </div>

                    <button type="submit" disabled={status === "loading"}>{status === "loading" ? "Pesquisando..." : "Pesquisar"}</button>
                </form>

                <section className="hospitais-results" aria-live="polite" aria-busy={status === "loading" || loadingMore}>
                    <h2>Resultados encontrados ({hospitals.length}):</h2>

                    {indexDate && <p className="hospitais-results__date">Base CNES: <time dateTime={indexDate}>{new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(indexDate))}</time></p>}

                    {hospitals.length > 0 ? (
                        <div className="hospitais-results__list">
                            {hospitals.map((hospital) => <HospitalCard key={hospital.cnes} hospital={hospital} />)}
                        </div>
                    ) : (
                        status !== "error" && <p className="hospitais-results__empty">{statusMessages[status]}</p>
                    )}

                    {errorMessage && <p className="hospitais-results__empty hospitais-results__empty--error">{errorMessage}</p>}

                    {nextCursor && <button className="hospitais-results__more" type="button" onClick={() => search.loadMore()} disabled={loadingMore}>
                        {loadingMore ? "Carregando mais hospitais..." : "Carregar mais"}
                    </button>}
                </section>
            </section>
        </main>
    );
}
