import { Link, useLocation } from "react-router";
import GeograficoResult from "../components/GeograficoResult";
import { cepPreview } from "../utils/geografico-preview";

const assets = "/assets/geografico/consultas";
const details = [
    { label: "Logradouro", value: cepPreview.street },
    { label: "Bairro", value: cepPreview.neighborhood },
    { label: "Cidade", value: cepPreview.city },
    { label: "UF", value: cepPreview.state },
    { label: "DDD", value: cepPreview.ddd },
];

export function meta() {
    return [
        { title: "AmpliaInfo — Detalhes do CEP" },
        { name: "description", content: "Prévia dos detalhes do Código de Endereçamento Postal." },
    ];
}

export default function DetalheCep() {
    const { state: savedSearch } = useLocation();
    return (
        <main className="cep-detail-page">
            <div className="cep-detail-content">
                <header className="cep-detail-heading">
                    <Link className="cep-detail-back" to="/geografico/consulta-cep" state={savedSearch}>
                        <img src={`${assets}/back.svg`} alt="" />Voltar aos resultados
                    </Link>
                    <div>
                        <h1>{cepPreview.cep}</h1>
                        <p>Detalhes do Código de Endereçamento Postal</p>
                    </div>
                </header>
                <GeograficoResult title="Informações Geográficas" details={details} icon="/assets/geografico/map-pin.svg">
                    <p className="geographic-result__note">Dados de exemplo · integração em breve</p>
                </GeograficoResult>
                <div className="cep-detail-privacy">
                    <img src={`${assets}/privacy-lock.svg`} alt="" />
                    <p>Dados protegidos em conformidade com a LGPD e o Marco Civil da Internet.</p>
                </div>
            </div>
        </main>
    );
}
