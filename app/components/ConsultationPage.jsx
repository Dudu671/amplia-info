import Breadcrumb from "./Breadcrumb";
import "../styles/components/consultation.scss";

export default function ConsultationPage({ title, description, breadcrumbs, children }) {
    return (
        <main className="consultation-page">
            <Breadcrumb items={breadcrumbs} />
            <section className="consultation-content container" aria-labelledby="consultation-title">
                <header className="consultation-heading">
                    <h1 id="consultation-title">{title}</h1>
                    <p>{description}</p>
                </header>
                {children}
            </section>
        </main>
    );
}
