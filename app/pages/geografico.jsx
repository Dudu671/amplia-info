import { Link } from "react-router";
import "../styles/pages/geografico.scss";

import ServiceCard from "../components/ServiceCard";

import CloudIcon from "../../public/assets/geografico/cloud-sun.svg?react";
import MapPinIcon from "../../public/assets/geografico/map-pin.svg?react";

const services = [
  {
    id: 1,
    title: "Previsão CPTEC",
    description:
      "Consulte interferências e efeitos de tempo em tempo real fornecidos pelo Centro de Previsão de Tempo e Estudos Climáticos.",
    Icon: CloudIcon,
    to: "/geografico/consulta-cptec",
  },
  {
    id: 2,
    title: "Consulta CEP",
    description:
      "Busque informações completas, logradouros, bairros e regiões do Brasil informando o Código de Endereçamento Postal.",
    Icon: MapPinIcon,
    to: "/geografico/consulta-cep",
  },
];

export function meta() {
  return [
    { title: "Amplia Info — Geográfico" },
    {
      name: "description",
      content: "Consulte dados públicos de forma rápida e simples.",
    },
  ];
}

export default function Geografico() {
  return (
    <main className="geografico-page">
      <nav className="breadcrumb container" aria-label="Breadcrumb">
        <span>Você está em:</span>
        <Link to="/">Início</Link>
        <span aria-hidden="true">/</span>
        <strong>Geográfico</strong>
      </nav>

      <section
        className="geografico-services container"
        aria-labelledby="geografico-title"
      >
        <header className="section-heading">
          <h1 id="geografico-title">Serviços de Informação — Geográfico</h1>
          <p>
            Informações geográficas, cartográficas, climáticas e de localização
            do Brasil.
          </p>
        </header>

        <div className="geografico-services-grid">
          {services.map(({ id, title, description, Icon, to }) => (
            <ServiceCard
              key={id}
              title={title}
              Icon={Icon}
              description={description}
              to={to}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
