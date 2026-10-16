import { Link } from "react-router";
import "../styles/components/service-card.scss";

export default function ServiceCard({ title, Icon, description, to = "#" }) {
  return (
    <Link className="service-card" to={to}>
      <div className="service-card__header">
        <span className="service-card__icon">
          <Icon />
        </span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      <span className="service-card__action">
        Acessar consulta
        <img src="/assets/financeiro/chevron-right.svg" alt="" />
      </span>
    </Link>
  );
}
