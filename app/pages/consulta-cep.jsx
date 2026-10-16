import { useState } from "react";
import { Link, useLocation } from "react-router";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import GeograficoNotice from "../components/GeograficoNotice";
import Dropdown from "../components/Dropdown";
import useCities from "../hooks/useCities";
import states from "../utils/states.json";
import { cepPreview } from "../utils/geografico-preview";

const assets = "/assets/geografico/consultas";

export function meta() {
    return [
        { title: "AmpliaInfo — Busca de CEP" },
        { name: "description", content: "Busca de CEP por estado, cidade e logradouro." },
    ];
}

export default function ConsultaCep() {
    const { state: savedSearch } = useLocation();
    const [filters, setFilters] = useState(savedSearch?.filters ?? { state: "", city: "", street: "" });
    const { cities, status: cityStatus } = useCities(filters.state);
    const [showPreview, setShowPreview] = useState(savedSearch?.showPreview ?? false);
    const [formError, setFormError] = useState("");

    function handleStateChange(state) {
        if (state === filters.state) return;
        setFilters((current) => ({ ...current, state, city: "" }));
        setShowPreview(false);
        setFormError("");
    }

    function handleCityChange(city) {
        setFilters((current) => ({ ...current, city }));
        setShowPreview(false);
        setFormError("");
    }

    function handleStreetChange(event) {
        const { value } = event.target;
        setFilters((current) => ({ ...current, street: value }));
        setShowPreview(false);
    }

    function handleSubmit() {
        if (!filters.state || !filters.city) {
            setFormError("Selecione o estado e a cidade para continuar.");
            return;
        }
        setFormError("");
        setShowPreview(true);
    }

    function getCityPlaceholder() {
        if (cityStatus === "loading") return "Carregando cidades...";
        if (cityStatus === "error") return "Não foi possível carregar cidades";
        return "Selecione a cidade";
    }

    return (
        <div className="geographic-consultation geographic-consultation--cep">
            <ConsultationPage
                title="Busca de CEP por Endereço"
                description="Localize códigos postais através da seleção de estado, cidade e logradouro."
                breadcrumbs={[{ label: "Geográfico", to: "/geografico" }, { label: "Busca de CEP" }]}>
                <ConsultationForm buttonLabel="Buscar CEP" onSubmit={handleSubmit}>
                    <ConsultationField id="cep-state" label="Estado (UF):">
                        <Dropdown id="cep-state" name="state" value={filters.state} options={states} placeholder="Selecione o estado"
                            onChange={handleStateChange} />
                    </ConsultationField>
                    <ConsultationField id="cep-city" label="Cidade:">
                        <Dropdown id="cep-city" name="city" value={filters.city} options={cities} placeholder={getCityPlaceholder()}
                            disabled={!filters.state || cityStatus !== "success" || !cities.length}
                            onChange={handleCityChange} />
                    </ConsultationField>
                    <ConsultationField id="cep-street" label="Bairro ou Logradouro:" icon={`${assets}/address.svg`}>
                        <input id="cep-street" name="street" value={filters.street} placeholder="Digite o nome da rua ou bairro" required pattern=".*\S.*"
                            onChange={handleStreetChange} />
                    </ConsultationField>
                    {cityStatus === "error" && <GeograficoNotice role="alert">Não foi possível carregar as cidades. Selecione outro estado e tente novamente.</GeograficoNotice>}
                    {formError && <GeograficoNotice role="alert">{formError}</GeograficoNotice>}
                </ConsultationForm>
                {showPreview && <section className="cep-preview" aria-labelledby="cep-preview-title" role="status">
                    <h2 id="cep-preview-title">Exemplo de resultado</h2>
                    <p>A consulta real estará disponível após a integração. Os dados abaixo são ilustrativos.</p>
                    <Link to="/geografico/consulta-cep/detalhe" state={{ filters, showPreview: true }}>
                        <strong>{cepPreview.cep}</strong>
                        <span>{cepPreview.street} · {cepPreview.neighborhood} · {cepPreview.city}/{cepPreview.state}</span>
                        <span className="cep-preview__action">Ver detalhes do exemplo →</span>
                    </Link>
                </section>}
            </ConsultationPage>
        </div>
    );
}
