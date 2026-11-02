import { useId } from "react";

export default function ConsultationResult({ title, details, icon }) {
    const titleId = useId();
    const visibleDetails = details.filter((detail) => detail.value != null && detail.value !== "");

    return (
        <section className="consultation-result" aria-labelledby={titleId}>
            <header className="consultation-result__header">
                {icon && <img src={icon} alt="" />}
                <h2 id={titleId}>{title}</h2>
            </header>
            <dl className="consultation-result__details">
                {visibleDetails.map(({ label, value }) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
