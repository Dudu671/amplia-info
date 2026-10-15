import { useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";

const vehicleTypes = [
    { value: "carros", label: "Carros" },
    { value: "motos", label: "Motos" },
    { value: "caminhoes", label: "Caminhões" },
];

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta FIPE" },
        { name: "description", content: "Consulte os preços médios de carros, motos e caminhões na tabela FIPE." },
    ];
}

export default function ConsultaFipe() {
    const [vehicleType, setVehicleType] = useState("");

    return (
        <ConsultationPage title="Consulta FIPE" description="Consulte a tabela de preços médios de veículos com base nos dados oficiais atualizados."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Consulta FIPE" }]}>
            <ConsultationForm buttonLabel="Consultar FIPE" includeLgpd>
                <ConsultationField id="vehicle-type" label="Tipo de veículo">
                    <select id="vehicle-type" name="vehicleType" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} required>
                        <option value="" disabled>Selecione o tipo de veículo</option>
                        {vehicleTypes.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </ConsultationField>
                <ConsultationField id="vehicle-brand" label="Marca do veículo">
                    <select id="vehicle-brand" name="brand" defaultValue="" required>
                        <option value="" disabled>Selecione a marca</option>
                    </select>
                </ConsultationField>
                <ConsultationField id="vehicle-model" label="Modelo">
                    <select id="vehicle-model" name="model" defaultValue="" required>
                        <option value="" disabled>Selecione o modelo</option>
                    </select>
                </ConsultationField>
                <ConsultationField id="vehicle-year" label="Ano">
                    <select id="vehicle-year" name="year" defaultValue="" required>
                        <option value="" disabled>Selecione o ano modelo</option>
                    </select>
                </ConsultationField>
            </ConsultationForm>
        </ConsultationPage>
    );
}
