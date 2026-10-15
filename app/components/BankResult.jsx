import "../styles/components/bank-result.scss";

export default function BankResult({ bank, preview = false }) {
    const details = [
        { label: "Banco", value: bank.name },
        { label: "Código", value: bank.code },
        { label: "ISPB", value: bank.ispb },
    ];

    return (
        <section className="bank-result" aria-labelledby="bank-result-title">
            <header className="bank-result__header">
                <img src="/assets/consultation/bank-status.svg" alt="" />
                <h2 id="bank-result-title">{preview ? "Exemplo de resultado" : "Banco Localizado"}</h2>
            </header>
            <dl className="bank-result__details">
                {details.map(({ label, value }) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
