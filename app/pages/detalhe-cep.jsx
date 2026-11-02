import { Link, useLocation } from "react-router";
import GeograficoResult from "../components/GeograficoResult";

const assets = "/assets/geografico/consultas";

export function meta() {
    return [
        { title: "AmpliaInfo — Detalhes do CEP" },
        { name: "description", content: "Detalhes do Código de Endereçamento Postal." },
    ];
}

function addressDetails(address) {
    return [
        { label: "Logradouro", value: address.street },
        address.complement && { label: "Complemento", value: address.complement },
        address.unit && { label: "Unidade", value: address.unit },
        { label: "Bairro", value: address.neighborhood || "Não informado" },
        { label: "Cidade", value: address.city || "Não informado" },
        { label: "UF", value: address.state || "Não informado" },
        { label: "DDD", value: address.ddd || "Não informado" },
    ].filter(Boolean);
}

export default function DetalheCep() {
    const { state: savedSearch } = useLocation();
    const address = savedSearch?.address;

    return (
        <main className="cep-detail-page">
            <div className="cep-detail-content">
                <header className="cep-detail-heading">
                    <Link className="cep-detail-back" to="/geografico/consulta-cep" state={savedSearch}>
                        <img src={`${assets}/back.svg`} alt="" />Voltar aos resultados
                    </Link>
                    {address ? (
                        <div>
                            <h1>{address.cep}</h1>
                            <p>Detalhes do Código de Endereçamento Postal</p>
                        </div>
                    ) : (
                        <div>
                            <h1>Nenhum CEP selecionado</h1>
                            <p>Volte à busca e escolha um endereço da lista.</p>
                        </div>
                    )}
                </header>
                {address && (
                    <GeograficoResult title="Informações Geográficas" details={addressDetails(address)} icon="/assets/geografico/map-pin.svg" />
                )}
                <div className="cep-detail-privacy">
                    <img src={`${assets}/privacy-lock.svg`} alt="" />
                    <p>Dados protegidos em conformidade com a LGPD e o Marco Civil da Internet.</p>
                </div>
            </div>
        </main>
    );
}
