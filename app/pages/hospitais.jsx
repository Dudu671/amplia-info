import { useState } from "react";
import { Link } from "react-router";
import Dropdown from "../components/Dropdown";
import HospitalCard from "../components/HospitalCard";
import { searchHospitais } from "../services/hospitais";
import states from "../utils/states.json";
import "../styles/pages/hospitais.scss";

const statusMessages = {
  idle: "Use os filtros acima para pesquisar hospitais.",
  loading: "Pesquisando hospitais...",
  success: "Nenhum hospital encontrado para os filtros informados.",
  error: "Não foi possível realizar a pesquisa. Tente novamente.",
};

const citiesByState = {
  DF: [{ value: "Brasília", label: "Brasília" }],
};

export function meta() {
    return [
        { title: "AmpliaInfo — Hospitais" },
        {
            name: "description",
            content: "Pesquise hospitais e unidades de atendimento.",
        },
    ];
}


export default function Hospitais() {
  const [filters, setFilters] = useState({
    name: "",
    state: "",
    city: "",
  });
  const [hospitals, setHospitals] = useState([]);
  const [status, setStatus] = useState("idle");

  function handleChange(event) {
    const { name, value } = event.target;

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  }

  function handleStateChange(state) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      state,
      city: "",
    }));
  }

  function handleCityChange(city) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      city,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");

    try {
      const results = await searchHospitais(filters);
      setHospitals(results);
      setStatus("success");
    } catch {
      setHospitals([]);
      setStatus("error");
    }
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

      <section
        className="hospitais-content container"
        aria-labelledby="hospitais-title"
      >
        <header className="hospitais-heading">
          <h1 id="hospitais-title">Pesquisa de Rede de Hospitais</h1>
          <p>
            Encontre unidades de atendimento do Sistema Único de Saúde (SUS) e
            parceiros conveniados.
          </p>
        </header>

        <form className="hospitais-filters" onSubmit={handleSubmit}>
          <div className="hospitais-field hospitais-field--name">
            <label htmlFor="hospital-name">Nome do Hospital</label>
            <input
              id="hospital-name"
              name="name"
              type="search"
              value={filters.name}
              onChange={handleChange}
              placeholder="Digite palavras-chave..."
            />
          </div>

          <div className="hospitais-field">
            <label htmlFor="hospital-state">Estado</label>
            <Dropdown
              id="hospital-state"
              name="state"
              value={filters.state}
              options={states}
              placeholder="Selecione um estado"
              onChange={handleStateChange}
            />
          </div>

          <div className="hospitais-field">
            <label htmlFor="hospital-city">Cidade</label>
            <Dropdown
              id="hospital-city"
              name="city"
              value={filters.city}
              options={citiesByState[filters.state] ?? []}
              placeholder={
                !filters.state
                  ? "Selecione primeiro o estado"
                  : citiesByState[filters.state]
                    ? "Selecione uma cidade"
                    : "Cidades indisponíveis"
              }
              disabled={!filters.state || !citiesByState[filters.state]}
              onChange={handleCityChange}
            />
          </div>

          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Pesquisando..." : "Pesquisar"}
          </button>
        </form>

        <section
          className="hospitais-results"
          aria-live="polite"
          aria-busy={status === "loading"}
        >
          <h2>Resultados encontrados ({hospitals.length}):</h2>

          {hospitals.length > 0 ? (
            <div className="hospitais-results__list">
              {hospitals.map((hospital, index) => (
                <HospitalCard
                  key={hospital.id ?? hospital.cnes ?? index}
                  hospital={hospital}
                />
              ))}
            </div>
          ) : (
            <p
              className={`hospitais-results__empty${
                status === "error" ? " hospitais-results__empty--error" : ""
              }`}
            >
              {statusMessages[status]}
            </p>
          )}
        </section>
      </section>
    </main>
  );
}
