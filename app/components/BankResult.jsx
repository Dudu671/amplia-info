import { useId } from "react";
import { formatBankCode } from "../utils/format";
import "../styles/components/bank-result.scss";

export default function BankResult({ bank, preview = false }) {
    const titleId = useId();
    const details = [
        { label: "Banco", value: bank.fullName || bank.name || "Não informado" },
        { label: "Código", value: formatBankCode(bank.code) },
        { label: "ISPB", value: bank.ispb || "Não informado" },
    ];

    return (
        <section className="bank-result" aria-labelledby={titleId}>
            <header className="bank-result__header">
                <img src="/assets/consultation/bank-status.svg" alt="" />
                <h2 id={titleId}>{preview ? "Exemplo de resultado" : "Banco Localizado"}</h2>
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
