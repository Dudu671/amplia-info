import { Link } from "react-router";
import "../styles/pages/home.scss";

import SearchIcon from "../../public/assets/home/search.svg?react";
import DollarIcon from "../../public/assets/home/dollar.svg?react";
import BuildingIcon from "../../public/assets/home/building.svg?react";
import HomeIcon from "../../public/assets/home/home.svg?react";
import GlobeIcon from "../../public/assets/home/globe.svg?react";
import HeartIcon from "../../public/assets/home/heart.svg?react";
import FileIcon from "../../public/assets/home/file.svg?react";

export function meta() {
  return [
    { title: "Amplia Info — Consultas Públicas" },
    {
      name: "description",
      content: "Consulte dados públicos de forma rápida e simples.",
    },
  ];
}

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-content">
          <h1>Consulte Informações Públicas do Brasil</h1>
          <p>
            Acesse dados governamentais de forma simplificada, transparente e
            segura em um só lugar.
          </p>
          <form
            className="search-form"
            onSubmit={(event) => event.preventDefault()}
            role="search"
          >
            <label className="visually-hidden" htmlFor="site-search">
              O que você está procurando?
            </label>
            <SearchIcon />
            <input
              id="site-search"
              type="search"
              placeholder={
                'O que você está procurando hoje? Ex: "Consulta CPF"'
              }
            />
            <button type="submit">Buscar</button>
          </form>
        </div>
      </section>
      <section
        className="categories"
        id="categorias"
        aria-labelledby="categories-title"
      >
        <div className="container">
          <h2 id="categories-title">Categorias de Consulta</h2>
          <div className="category-grid">
            {categories.map(({ title, Icon, to }) => (
              <Link
                className="category-card"
                to={to ?? "#categorias"}
                key={title}
              >
                <Icon style={{ color: "#007ea7", width: 24, height: 24 }} />
                <span>{title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

const categories = [
  { title: "Financeiro", Icon: DollarIcon, to: "/financeiro" },
  { title: "Empresarial", Icon: BuildingIcon },
  { title: "Propriedade", Icon: HomeIcon },
  { title: "Geografia", Icon: GlobeIcon },
  { title: "Saúde", Icon: HeartIcon },
  { title: "Geral", Icon: FileIcon },
];
