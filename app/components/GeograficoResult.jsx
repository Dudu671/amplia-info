import { useId } from "react";
import "../styles/components/geografico-result.scss";

export default function GeograficoResult({ title, details, icon, variant = "default", badge, children }) {
    const titleId = useId();
    return (
        <section className={`geographic-result${variant === "striped" ? " geographic-result--striped" : ""}`} aria-labelledby={titleId}>
            <header className="geographic-result__header">
                <span className="geographic-result__icon"><img src={icon} alt="" /></span>
                <h2 id={titleId}>{title}</h2>
                {badge && <span className="geographic-result__badge">{badge}</span>}
            </header>
            <dl className="geographic-result__details">
                {details.map(({ label, value }) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
            {children}
        </section>
    );
}
