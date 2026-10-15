import { useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import Dropdown from "../components/Dropdown";
import currencies from "../utils/currencies.json";

const currencyOptions = currencies.map(({ value, label }) => ({ value, label: `${value} — ${label}` }));

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Câmbio" },
        { name: "description", content: "Consulte taxas de câmbio entre moedas." },
    ];
}

export default function ConsultaCambio() {
    const [currency, setCurrency] = useState("");

    return (
        <ConsultationPage title="Consulta de Câmbio" description="Consulte taxas de câmbio entre moedas em tempo real."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Câmbio" }]}>
            <ConsultationForm buttonLabel="Consultar" disabled={!currency}>
                <ConsultationField id="currency" label="Moeda de origem:">
                    <Dropdown id="currency" name="currency" value={currency} options={currencyOptions}
                        placeholder="Selecione a moeda" icon="/assets/financeiro/coins.svg" onChange={setCurrency} />
                </ConsultationField>
            </ConsultationForm>
        </ConsultationPage>
    );
}
