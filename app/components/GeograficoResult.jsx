import { useId } from "react";
import "../styles/components/geografico-result.scss";

export default function GeograficoResult({ title, details, icon, children }) {
    const titleId = useId();
    return (
        <section className="geographic-result" aria-labelledby={titleId}>
            <header className="geographic-result__header">
                <span className="geographic-result__icon"><img src={icon} alt="" /></span>
                <h2 id={titleId}>{title}</h2>
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
