import { Link } from "react-router";
import "../styles/pages/financeiro.scss";

import ServiceCard from "../components/ServiceCard";

import CoinsIcon from "../../public/assets/financeiro/coins.svg?react";
import CarIcon from "../../public/assets/financeiro/car.svg?react";
import BuildingIcon from "../../public/assets/financeiro/building.svg?react";
import LockIcon from "../../public/assets/financeiro/lock.svg?react";

const services = [
  {
    id: 1,
    title: "Câmbio Comercial",
    description:
      "Verifique as taxas de câmbio atualizadas em tempo real para conversão de moedas estrangeiras oficiais.",
    Icon: CoinsIcon,
  },
  {
    id: 2,
    title: "Tabela FIPE",
    description:
      "Consulte o preço médio de mercado de carros, motos e caminhões novos ou usados cadastrados no Brasil.",
    Icon: CarIcon,
  },
  {
    id: 3,
    title: "Corretoras de Valores",
    description:
      "Consulte a listagem e a situação de autorização de corretoras e distribuidoras habilitadas pela CVM.",
    Icon: BuildingIcon,
  },
  {
    id: 4,
    title: "Bancos e Instituições",
    description:
      "Verifique a lista de bancos cadastrados, códigos de compensação bancária e instituições financeiras ativas.",
    Icon: LockIcon,
  },
];

export function meta() {
  return [
    { title: "Amplia Info — Financeiro" },
    {
      name: "description",
      content: "Consulte dados públicos de forma rápida e simples.",
    },
  ];
}

export default function Financeiro() {
  return (
    <main className="financial-page">
      <nav className="breadcrumb container" aria-label="Breadcrumb">
        <span>Você está em:</span>
        <Link to="/">Início</Link>
        <span aria-hidden="true">/</span>
        <strong>Financeiro</strong>
      </nav>

      <section
        className="financial-services container"
        aria-labelledby="financial-title"
      >
        <header className="section-heading">
          <h1 id="financial-title">Serviços de Informação — Financeiro</h1>
          <p>
            Informações financeiras, taxas de juros, mercado de capitais e
            transações bancárias.
          </p>
        </header>

        <div className="financial-services-grid">
          {services.map(({ id, title, Icon, description }) => (
            <ServiceCard
              key={id}
              title={title}
              Icon={Icon}
              description={description}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
