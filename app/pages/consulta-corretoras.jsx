import { useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Corretoras" },
        { name: "description", content: "Pesquise corretoras de valores autorizadas pela CVM." },
    ];
}

export default function ConsultaCorretoras() {
    const [name, setName] = useState("");

    return (
        <ConsultationPage title="Consulta de Corretoras" description="Liste e consulte corretoras de valores autorizadas pela CVM."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Corretoras" }]}>
            <ConsultationForm buttonLabel="Pesquisar">
                <ConsultationField id="broker-name" label="Pesquisar corretora por nome:" icon="/assets/financeiro/building.svg">
                    <input id="broker-name" name="name" type="search" value={name} onChange={(event) => setName(event.target.value)}
                        placeholder="Digite o nome da corretora" autoComplete="off" required />
                </ConsultationField>
            </ConsultationForm>
        </ConsultationPage>
    );
}
