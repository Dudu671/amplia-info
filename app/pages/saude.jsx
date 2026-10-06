import { Link } from "react-router";
import "../styles/pages/saude.scss";

import ServiceCard from "../components/ServiceCard";

import HospitalIcon from "../../public/assets/saude/hospital.svg?react";

const services = [
    {
        id: 1,
        title: "Hospitais e Unidades",
        description: "Encontre hospitais públicos, postos de saúde, UPAs e demais unidades de atendimento do SUS em todo o território nacional.",
        Icon: HospitalIcon,
        to: "/saude/hospitais",
    }
];



export function meta() {
    return [
        { title: "AmpliaInfo — Saúde" },
        {
            name: "description",
            content: "Encontre hospitais públicos, postos de saúde, UPAs e outras unidades de atendimento do SUS.",

        },
    ];
}

export default function Saude() {
    return (
        <main className="health-page">
            <nav className="breadcrumb container" aria-label="Breadcrumb">
                <span>Você está em:</span>
                <Link to="/">Início</Link>
                <span aria-hidden="true">/</span>
                <strong>Saúde</strong>
            </nav>

            <section
                className="health-services container"
                aria-labelledby="health-title"
            >
                <header className="section-heading">
                    <h1 id="health-title">
                        Serviços de Informação — Saúde
                    </h1>

                    <p>
                        Informações sobre saúde pública e serviços médicos federais e estaduais.
                    </p>
                </header>

                <div className="health-services-grid">
                    {services.map(({ id, title, description, Icon, to }) => (
                        <ServiceCard
                            key={id}
                            title={title}
                            description={description}
                            Icon={Icon}
                            to={to}
                        />
                    ))}
                </div>
            </section>
        </main>
    )
}
