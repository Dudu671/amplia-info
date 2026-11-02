import { formatPhoneNumber } from "../utils/format.js";
import "../styles/components/hospital-card.scss";

export default function HospitalCard({ hospital }) {
    const name = hospital.name ?? hospital.nome ?? "Hospital sem nome informado";
    const type = hospital.type ?? hospital.tipo;
    const address = hospital.address ?? hospital.endereco;
    const phone = formatPhoneNumber(hospital.phone ?? hospital.telefone);

    return (
        <article className="hospital-card">
            <header className="hospital-card__header">
                <span className="hospital-card__icon" aria-hidden="true">
                    <img src="/assets/saude/hospitais/hospital.svg" alt="" />
                </span>

                <div className="hospital-card__heading">
                    <h3>{name}</h3>
                    {type && <span className="hospital-card__tag">{type}</span>}
                </div>
            </header>

            {(address || phone) && (
                <div className="hospital-card__details">
                    {address && (
                        <div className="hospital-card__detail">
                            <img
                                src="/assets/saude/hospitais/map-pin.svg"
                                alt=""
                                aria-hidden="true"
                            />
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${address} — abrir no Google Maps (nova aba)`}
                            >{address}</a>
                        </div>
                    )}

                    {phone && (
                        <div className="hospital-card__detail">
                            <img
                                src="/assets/saude/hospitais/phone.svg"
                                alt=""
                                aria-hidden="true"
                            />
                            <span>{phone}</span>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
