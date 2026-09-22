import { Link } from "react-router";
import "../styles/pages/empresarial.scss";

import ServiceCard from "../components/ServiceCard";

import BuildingIcon from "../../public/assets/home/building.svg?react";
import GlobeIcon from "../../public/assets/home/globe.svg?react";

const services = [
    {
        id: 1,
        title: "Consulta CNPJ",
        description:
            "Verifique dados cadastrais de pessoas jurídicas diretamente na base oficial da Receita Federal do Brasil.",
        Icon: BuildingIcon,
    },
    {
        id: 2,
        title: "Registro BR",
        description:
            "Consulte a disponibilidade de nomes de domínio, titularidade e status de registro com extensão '.br'.",
        Icon: GlobeIcon,
    },
];

export function meta() {
    return [
        { title: "AmpliaInfo — Empresarial" },
        {
            name: "description",
            content: "Serviços para empresas, registros comerciais e domínios.",
        },
    ];
}

export default function Empresarial() {
    return (
        <main className="business-page">
            <nav className="breadcrumb container" aria-label="Breadcrumb">
                <span>Você está em:</span>
                <Link to="/">Início</Link>
                <span aria-hidden="true">/</span>
                <strong>Empresarial</strong>
            </nav>

            <section
                className="business-services container"
                aria-labelledby="business-title"
            >
                <header className="section-heading">
                    <h1 id="business-title">
                        Serviços de Informação — Empresarial
                    </h1>

                    <p>
                        Serviços para empresas, registros comerciais, importação e
                        domínios de internet.
                    </p>
                </header>

                <div className="business-services-grid">
                    {services.map(({ id, title, description, Icon }) => (
                        <ServiceCard
                            key={id}
                            title={title}
                            description={description}
                            Icon={Icon}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}