import { formatIsoDate } from "../utils/format";
import { forecastDayTitle, formatDayMonth, formatObservationTime } from "../services/cptec";
import WeatherIcon from "./WeatherIcon";

function formatTemp(value) {
    return Number.isFinite(Number(value)) ? `${value}°C` : "—";
}

function todayInSaoPaulo() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export default function WeatherReport({ forecast, onChangeCity }) {
    const today = todayInSaoPaulo();
    const featured = forecast.days[0];
    const upcoming = forecast.days.slice(1);
    const place = forecast.state ? `${forecast.city} — ${forecast.state}` : forecast.city;
    const observedAt = formatObservationTime(forecast.current?.observedAt);
    const currentTemperature = forecast.current?.temperature;

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
            <div className={`weather-today${featured.uv ? "" : " weather-today--single"}`}>
                <section className="weather-current" aria-label={`Temperatura atual em ${place}`}>
                    <div className="weather-current__top">
                        <span>Tempo atual</span>
                        {observedAt ? <span>Atualizado às {observedAt}</span> : forecast.updatedAt && <span>Atualizado em {formatIsoDate(forecast.updatedAt)}</span>}
                    </div>
                    <div className="weather-current__hero">
                        <WeatherIcon code={featured.conditionCode} />
                        <div>
                            <strong>{currentTemperature == null ? "—" : formatTemp(currentTemperature)}</strong>
                            <span>Atual</span>
                            <p>{featured.condition}</p>
                        </div>
                    </div>
                    <p className="weather-current__range">
                        <span>Mínima: {formatTemp(featured.min)}</span>
                        <span>Máxima: {formatTemp(featured.max)}</span>
                    </p>
                </section>
                <dl className="weather-stats">
                    <div className="weather-stat">
                        <span className="weather-stat__icon" aria-hidden="true"><WeatherIcon code={featured.conditionCode} /></span>
                        <div>
                            <dt>Condição</dt>
                            <dd>{featured.condition}</dd>
                        </div>
                    </div>
                    {featured.uv && (
                        <div className="weather-stat">
                            <span className="weather-stat__icon weather-stat__icon--uv" aria-hidden="true">UV</span>
                            <div>
                                <dt>Índice UV</dt>
                                <dd>{featured.uv.value} ({featured.uv.level})</dd>
                            </div>
                        </div>
                    )}
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
                A temperatura atual é a leitura deste momento. Condição, mínima, máxima e o índice UV, quando informado, são a previsão diária do CPTEC/INPE.
            </p>
        </article>
    );
}
