import { useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import GeograficoNotice from "../components/GeograficoNotice";
import GeograficoResult from "../components/GeograficoResult";
import { weatherPreview } from "../utils/geografico-preview";

export function meta() {
    return [
        { title: "AmpliaInfo — Previsão do Tempo CPTEC" },
        { name: "description", content: "Previsão do tempo pelo Centro de Previsão de Tempo e Estudos Climáticos." },
    ];
}

export default function ConsultaCptec() {
    const [city, setCity] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleCityChange(event) {
        setCity(event.target.value);
        setSubmitted(false);
    }

    function handleSubmit() {
        setSubmitted(true);
    }

    return (
        <div className="geographic-consultation geographic-consultation--weather">
            <ConsultationPage title="Previsão do Tempo — CPTEC"
                description="Previsão do tempo pelo Centro de Previsão de Tempo e Estudos Climáticos."
                breadcrumbs={[{ label: "Geográfico", to: "/geografico" }, { label: "CPTEC" }]}>
                <ConsultationForm buttonLabel="Consultar" onSubmit={handleSubmit}>
                    <ConsultationField id="weather-city" label="Digite o nome da cidade:" icon="/assets/geografico/map-pin.svg">
                        <input id="weather-city" name="city" value={city} onChange={handleCityChange}
                            placeholder="Nome da cidade" required pattern=".*\S.*" />
                    </ConsultationField>
                </ConsultationForm>
                {submitted && <GeograficoNotice>A consulta ao CPTEC estará disponível após a integração. Abaixo está uma prévia com dados de exemplo.</GeograficoNotice>}
                <GeograficoResult title="Previsão do Tempo" details={weatherPreview} icon="/assets/geografico/cloud-sun.svg">
                    <p className="geographic-result__note">Dados de exemplo · integração em breve</p>
                </GeograficoResult>
            </ConsultationPage>
        </div>
    );
}
