import { formatIsoDate } from "../utils/format";
import { forecastDayTitle, formatDayMonth, formatObservationTime } from "../services/cptec";
import WeatherIcon from "./WeatherIcon";

function formatTemp(value) {
    return Number.isFinite(Number(value)) ? `${value}°C` : "—";
}

function StatIcon({ children }) {
    return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

function todayInSaoPaulo() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export default function WeatherReport({ forecast, onChangeCity }) {
    const today = todayInSaoPaulo();
    const featured = forecast.days[0];
    const upcoming = forecast.days.slice(1);
    const place = forecast.state ? `${forecast.city} — ${forecast.state}` : forecast.city;
    const current = forecast.current;
    const observedAt = formatObservationTime(current?.observedAt);
    const currentTemperature = current?.temperature;
    const condition = current?.condition || featured.condition;
    const conditionCode = current?.conditionCode || featured.conditionCode;
    const uvLabel = current?.uv ? `${current.uv.value} (${current.uv.level})` : "—";

    return (
        <article className="weather-report">
            <header className="weather-report__heading">
                <div>
                    <h1>Previsão do tempo</h1>
                    <p className="weather-report__place">
                        <img src="/assets/geografico/map-pin.svg" alt="" />
                        <span>{place}</span>
                        <button type="button" onClick={onChangeCity}>Trocar cidade</button>
                    </p>
                </div>
                <p className="weather-source"><span aria-hidden="true" />Fonte: CPTEC / INPE</p>
            </header>

            <h2 className="weather-kicker">{forecastDayTitle(featured.date, today)}</h2>
            <div className="weather-today">
                <section className="weather-current" aria-label={`Temperatura atual em ${place}`}>
                    <div className="weather-current__top">
                        <span>Tempo atual</span>
                        {observedAt ? <span>Atualizado às {observedAt}</span> : forecast.updatedAt && <span>Atualizado em {formatIsoDate(forecast.updatedAt)}</span>}
                    </div>
                    <div className="weather-current__hero">
                        <WeatherIcon code={conditionCode} />
                        <div>
                            <strong>{currentTemperature == null ? "—" : formatTemp(currentTemperature)}</strong>
                            <span>Atual</span>
                            <p>{condition}</p>
                        </div>
                    </div>
                    <p className="weather-current__range">
                        <span>Mínima: {formatTemp(featured.min)}</span>
                        <span>Máxima: {formatTemp(featured.max)}</span>
                    </p>
                </section>
                <dl className="weather-stats">
                    <div className="weather-stat">
                        <span className="weather-stat__icon" aria-hidden="true"><WeatherIcon code={conditionCode} /></span>
                        <div>
                            <dt>Condição</dt>
                            <dd>{condition}</dd>
                        </div>
                    </div>
                    <div className="weather-stat">
                        <span className="weather-stat__icon" aria-hidden="true">
                            <StatIcon><path d="M12 3.2c2.6 3.4 5.6 6.8 5.6 10.1a5.6 5.6 0 0 1-11.2 0C6.4 10 9.4 6.6 12 3.2Z" /></StatIcon>
                        </span>
                        <div>
                            <dt>Umidade Relativa</dt>
                            <dd>{current?.humidity ?? "—"}</dd>
                        </div>
                    </div>
                    <div className="weather-stat">
                        <span className="weather-stat__icon" aria-hidden="true">
                            <StatIcon><path d="M3 8h11a2.8 2.8 0 1 0-2.8-2.8M3 12h15a2.8 2.8 0 1 1-2.8 2.8M3 16h8" /></StatIcon>
                        </span>
                        <div>
                            <dt>Vento</dt>
                            <dd>{current?.wind ?? "—"}</dd>
                        </div>
                    </div>
                    <div className="weather-stat">
                        <span className="weather-stat__icon" aria-hidden="true">
                            <StatIcon><path d="M12 3.5 19 6.2v5.2c0 4.2-2.8 7.2-7 8.6-4.2-1.4-7-4.4-7-8.6V6.2L12 3.5Z" /></StatIcon>
                        </span>
                        <div>
                            <dt>Índice UV</dt>
                            <dd>{uvLabel}</dd>
                        </div>
                    </div>
                </dl>
            </div>

            {upcoming.length > 0 && (
                <>
                    <h2 className="weather-kicker">Próximos dias</h2>
                    <div className="weather-table-wrap">
                        <table className="weather-table">
                            <thead>
                                <tr>
                                    <th scope="col">Data</th>
                                    <th scope="col">Mín.</th>
                                    <th scope="col">Máx.</th>
                                    <th scope="col">Condição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.map((day) => (
                                    <tr key={day.date}>
                                        <td>{formatDayMonth(day.date)}</td>
                                        <td className="weather-min">{formatTemp(day.min)}</td>
                                        <td className="weather-max">{formatTemp(day.max)}</td>
                                        <td className="weather-condition"><WeatherIcon code={day.conditionCode} /><span>{day.shortCondition}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <p className="weather-note">
                <span aria-hidden="true">i</span>
                Temperatura, condição, umidade, vento e índice UV são a leitura deste momento. Mínima e máxima são a previsão diária do CPTEC/INPE.
            </p>
        </article>
    );
}
