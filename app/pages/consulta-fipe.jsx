import { useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import Dropdown from "../components/Dropdown";

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
                    <Dropdown id="vehicle-type" name="vehicleType" value={vehicleType} options={vehicleTypes}
                        placeholder="Selecione o tipo de veículo" onChange={setVehicleType} />
                </ConsultationField>
                <ConsultationField id="vehicle-brand" label="Marca do veículo">
                    <Dropdown id="vehicle-brand" name="brand" value="" options={[]} disabled
                        placeholder={vehicleType ? "Marcas indisponíveis no momento" : "Selecione primeiro o tipo de veículo"} />
                </ConsultationField>
                <ConsultationField id="vehicle-model" label="Modelo">
                    <Dropdown id="vehicle-model" name="model" value="" options={[]} disabled placeholder="Selecione primeiro a marca" />
                </ConsultationField>
                <ConsultationField id="vehicle-year" label="Ano">
                    <Dropdown id="vehicle-year" name="year" value="" options={[]} disabled placeholder="Selecione primeiro o modelo" />
                </ConsultationField>
            </ConsultationForm>
        </ConsultationPage>
    );
}
