import { weatherIconKind } from "../services/cptec";

export default function WeatherIcon({ code, className = "" }) {
    const kind = weatherIconKind(code);
    return (
        <svg className={`weather-icon weather-icon--${kind} ${className}`.trim()} viewBox="0 0 24 24" aria-hidden="true">
            {(kind === "sun" || kind === "partly") && (
                <g className="weather-icon__sun">
                    <circle cx={kind === "partly" ? 8 : 12} cy={kind === "partly" ? 8 : 12} r={kind === "partly" ? 2.7 : 4} />
                    <path d={kind === "partly"
                        ? "M8 2.4v1.5M3.4 8H4.9M4.6 4.6l1.1 1.1"
                        : "M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"} />
                </g>
            )}
            {kind !== "sun" && (
                <path className="weather-icon__cloud" d="M7.4 18.2h9a3.5 3.5 0 0 0 .4-7A4.8 4.8 0 0 0 8 12.4a3.3 3.3 0 0 0-.6 5.8Z" />
            )}
            {kind === "rain" && <path className="weather-icon__drops" d="M8.6 20.2 7.7 22.4M12 20.2l-.9 2.2M15.4 20.2l-.9 2.2" />}
            {kind === "storm" && <path className="weather-icon__drops" d="M12 18.4 10.4 21.4h2.2L11.2 24" />}
        </svg>
    );
}
