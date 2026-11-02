import { useEffect, useRef, useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import Breadcrumb from "../components/Breadcrumb";
import WeatherReport from "../components/WeatherReport";
import { chooseCities, getPrevisao, getTemperaturaAtual, searchCidades } from "../services/cptec";
import { normalizeText } from "../utils/text";

import "../styles/pages/consulta-cptec.scss";

const breadcrumbs = [{ label: "Geográfico", to: "/geografico" }, { label: "CPTEC" }];

export function meta() {
    return [
        { title: "AmpliaInfo — Previsão do Tempo CPTEC" },
        { name: "description", content: "Previsão do tempo pelo Centro de Previsão de Tempo e Estudos Climáticos." },
    ];
}

export default function ConsultaCptec() {
    const requestRef = useRef(null);
    const [city, setCity] = useState("");
    const [matches, setMatches] = useState([]);
    const [matchTotal, setMatchTotal] = useState(0);
    const [forecast, setForecast] = useState(null);
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => requestRef.current?.abort(), []);

    function resetResult() {
        requestRef.current?.abort();
        setForecast(null);
        setMatches([]);
        setMatchTotal(0);
        setStatus("idle");
        setErrorMessage("");
    }

    async function loadForecast(city, controller) {
        const [data, current] = await Promise.all([
            getPrevisao(city.id, controller.signal),
            getTemperaturaAtual(city, controller.signal).catch((error) => {
                if (error.name === "AbortError") throw error;
                return null;
            }),
        ]);
        if (controller.signal.aborted) return;
        setForecast({ ...data, current });
        setMatches([]);
        setStatus("success");
    }

    async function handleSubmit() {
        const term = city.trim();
        if (normalizeText(term).length < 3) {
            setErrorMessage("Digite pelo menos 3 letras do nome da cidade.");
            setStatus("error");
            setForecast(null);
            setMatches([]);
            return;
        }

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        setErrorMessage("");
        setForecast(null);
        setMatches([]);

        try {
            const cities = chooseCities(await searchCidades(term, controller.signal), term);
            if (controller.signal.aborted) return;
            if (cities.length === 0) {
                setErrorMessage("Nenhuma cidade encontrada com esse nome.");
                setStatus("error");
                return;
            }
            if (cities.length > 1) {
                setMatches(cities.slice(0, 12));
                setMatchTotal(cities.length);
                setStatus("choosing");
                return;
            }
            await loadForecast(cities[0], controller);
        } catch (error) {
            if (error.name === "AbortError" || controller.signal.aborted) return;
            setErrorMessage(error.message);
            setStatus("error");
        }
    }

    async function handleCityChoice(city) {
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        setErrorMessage("");

        try {
            await loadForecast(city, controller);
        } catch (error) {
            if (error.name === "AbortError" || controller.signal.aborted) return;
            setErrorMessage(error.message);
            setStatus("error");
        }
    }

    return (
        <div className="geographic-consultation geographic-consultation--weather">
            {forecast ? (
                <main className="weather-page">
                    <Breadcrumb items={breadcrumbs} />
                    <div className="container">
                        <WeatherReport forecast={forecast} onChangeCity={resetResult} />
                    </div>
                </main>
            ) : (
                <ConsultationPage title="Previsão do Tempo — CPTEC" description="Previsão do tempo pelo Centro de Previsão de Tempo e Estudos Climáticos." breadcrumbs={breadcrumbs}>
                    <ConsultationForm buttonLabel={status === "loading" ? "Consultando..." : "Consultar"} onSubmit={handleSubmit} disabled={status === "loading"}>
                        <ConsultationField id="weather-city" label="Digite o nome da cidade:" icon="/assets/geografico/map-pin.svg">
                            <input id="weather-city" name="city" value={city} onChange={(event) => { setCity(event.target.value); if (status !== "idle") resetResult(); }}
                                placeholder="Nome da cidade" required minLength={3} pattern=".*\S.*" />
                        </ConsultationField>
                    </ConsultationForm>
                    {(status === "error" || status === "choosing") && (
                        <section className="weather-feedback" aria-live="polite">
                            {status === "error" && <p className="consultation-status consultation-status--error" role="alert">{errorMessage}</p>}
                            {status === "choosing" && (
                                <>
                                    <p>Há mais de uma cidade com esse nome. Escolha uma:</p>
                                    <ul>
                                        {matches.map((match) => (
                                            <li key={match.id}>
                                                <button type="button" onClick={() => handleCityChoice(match)}>{match.nome} — {match.estado}</button>
                                            </li>
                                        ))}
                                    </ul>
                                    {matchTotal > matches.length && <p>Mostrando {matches.length} de {matchTotal}. Refine o nome da cidade.</p>}
                                </>
                            )}
                        </section>
                    )}
                </ConsultationPage>
            )}
        </div>
    );
}
