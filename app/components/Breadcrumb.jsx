import { Fragment } from "react";
import { Link } from "react-router";
import "../styles/components/breadcrumb.scss";

export default function Breadcrumb({ items }) {
    return (
        <nav className="consultation-breadcrumb container" aria-label="Breadcrumb">
            <span>Você está em:</span>
            <Link to="/">Início</Link>
            {items.map(({ label, to }) => (
                <Fragment key={label}>
                    <span aria-hidden="true">/</span>
                    {to ? <Link to={to}>{label}</Link> : <strong aria-current="page">{label}</strong>}
                </Fragment>
            ))}
        </nav>
    );
}
