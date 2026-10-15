import { useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import BankResult from "../components/BankResult";

const exampleBank = { name: "Exemplo S.A.", code: "341", ispb: "60701190" };

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Bancos" },
        { name: "description", content: "Consulte bancos, códigos de compensação e instituições financeiras." },
    ];
}

export default function ConsultaBancos() {
    const [query, setQuery] = useState("");

    return (
        <ConsultationPage title="Consulta de Bancos" description="Consulte a lista de bancos e instituições financeiras autorizadas pelo Banco Central."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Bancos" }]}>
            <ConsultationForm buttonLabel="Pesquisar">
                <ConsultationField id="bank-query" label="Pesquisar banco por nome ou código:" icon="/assets/financeiro/bank.svg">
                    <input id="bank-query" name="query" type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                        placeholder="Digite o nome ou código do banco" autoComplete="off" required />
                </ConsultationField>
            </ConsultationForm>
            <BankResult bank={exampleBank} preview />
        </ConsultationPage>
    );
}
