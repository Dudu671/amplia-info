import { useEffect, useRef, useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import ConsultationResult from "../components/ConsultationResult";
import Dropdown from "../components/Dropdown";
import { getCotacao, listMoedas } from "../services/cambio";
import { convertAmount, formatAmountInput, parseAmountInput, sanitizeAmountInput } from "../utils/amount";
import { formatIsoDate, formatRate } from "../utils/format";
import currencies from "../utils/currencies.json";

const currencyLabels = new Map(currencies.map(({ value, label }) => [value, label]));

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta de Câmbio" },
        { name: "description", content: "Consulte taxas de câmbio entre moedas." },
    ];
}

export default function ConsultaCambio() {
    const requestRef = useRef(null);
    const [moedas, setMoedas] = useState([]);
    const [currencyStatus, setCurrencyStatus] = useState("loading");
    const [currency, setCurrency] = useState("");
    const [quote, setQuote] = useState(null);
    const [foreignAmount, setForeignAmount] = useState("");
    const [brlAmount, setBrlAmount] = useState("");
    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function loadCurrencies() {
            try {
                const data = await listMoedas(controller.signal);
                if (controller.signal.aborted) return;
                setMoedas(data);
                setCurrencyStatus("success");
            } catch (error) {
                if (error.name === "AbortError") return;
                setCurrencyStatus("error");
            }
        }

        loadCurrencies();
        return () => controller.abort();
    }, []);

    useEffect(() => () => requestRef.current?.abort(), []);

    function clearAmounts() {
        setForeignAmount("");
        setBrlAmount("");
    }

    function handleCurrencyChange(value) {
        setCurrency(value);
        setQuote(null);
        clearAmounts();
        setStatus("idle");
        setErrorMessage("");
    }

    function handleForeignAmountChange(event) {
        const nextAmount = sanitizeAmountInput(event.target.value);
        setForeignAmount(nextAmount);
        const amount = parseAmountInput(nextAmount);
        const converted = amount == null ? null : convertAmount(amount, quote.sell, "to-brl");
        setBrlAmount(converted == null ? "" : formatAmountInput(converted));
    }

    function handleBrlAmountChange(event) {
        const nextAmount = sanitizeAmountInput(event.target.value);
        setBrlAmount(nextAmount);
        const amount = parseAmountInput(nextAmount);
        const converted = amount == null ? null : convertAmount(amount, quote.sell, "to-foreign");
        setForeignAmount(converted == null ? "" : formatAmountInput(converted));
    }

    async function handleSubmit() {
        if (!currency) return;

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setStatus("loading");
        setQuote(null);
        clearAmounts();
        setErrorMessage("");

        try {
            const data = await getCotacao(currency, controller.signal);
            if (controller.signal.aborted) return;
            setQuote(data);
            setStatus("success");
        } catch (error) {
            if (error.name === "AbortError" || controller.signal.aborted) return;
            setErrorMessage(error.message);
            setStatus("error");
        }
    }

    const currencyOptions = moedas.map(({ symbol, name }) => ({
        value: symbol,
        label: `${symbol} — ${currencyLabels.get(symbol) ?? name}`,
    }));
    const selectedCurrency = currencyOptions.find((option) => option.value === quote?.currency);

    function getCurrencyPlaceholder() {
        if (currencyStatus === "loading") return "Carregando moedas...";
        if (currencyStatus === "error") return "Não foi possível carregar as moedas";
        return "Selecione a moeda";
    }

    return (
        <ConsultationPage title="Consulta de Câmbio" description="Consulte taxas de câmbio entre moedas em tempo real."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Câmbio" }]}>
            <ConsultationForm buttonLabel={status === "loading" ? "Consultando..." : "Consultar"} onSubmit={handleSubmit}
                disabled={!currency || status === "loading" || currencyStatus !== "success"}>
                <ConsultationField id="currency" label="Moeda de origem:">
                    <Dropdown id="currency" name="currency" value={currency} options={currencyOptions}
                        placeholder={getCurrencyPlaceholder()} icon="/assets/financeiro/coins.svg"
                        disabled={currencyStatus !== "success"} onChange={handleCurrencyChange} />
                </ConsultationField>
            </ConsultationForm>
            {(currencyStatus === "error" || status !== "idle") && <section className="consultation-results" aria-busy={status === "loading"}>
                <div className="consultation-results__status" aria-live="polite">
                    {currencyStatus === "error" && <p className="consultation-status consultation-status--error" role="alert">Não foi possível carregar as moedas. Recarregue a página para tentar novamente.</p>}
                    {status === "loading" && <p className="consultation-status">Consultando a cotação PTAX...</p>}
                    {status === "error" && <p className="consultation-status consultation-status--error" role="alert">{errorMessage}</p>}
                    {status === "success" && quote && (
                        <>
                            <ConsultationResult title={selectedCurrency?.label ?? quote.currency} icon="/assets/financeiro/coins.svg"
                                details={[
                                    { label: "Compra", value: formatRate(quote.buy) },
                                    { label: "Venda", value: formatRate(quote.sell) },
                                    { label: "Data", value: formatIsoDate(quote.date) },
                                    { label: "Boletim", value: quote.bulletin },
                                ]} />
                            <p className="consultation-note">Cotação PTAX em reais, publicada pelo Banco Central. O dia corrente ainda não fica disponível nessa consulta.</p>
                        </>
                    )}
                </div>
                {status === "success" && quote && (
                    <form className="exchange-converter" onSubmit={(event) => event.preventDefault()}>
                        <h2>Converter valor</h2>
                        <div className="exchange-converter__fields">
                            <ConsultationField id="amount-foreign" label={`Valor em ${quote.currency}`}>
                                <input id="amount-foreign" name="foreignAmount" type="text" inputMode="decimal" autoComplete="off"
                                    value={foreignAmount} onChange={handleForeignAmountChange} placeholder="0,00" aria-describedby="exchange-rate-basis" />
                            </ConsultationField>
                            <ConsultationField id="amount-brl" label="Valor em BRL">
                                <input id="amount-brl" name="brlAmount" type="text" inputMode="decimal" autoComplete="off"
                                    value={brlAmount} onChange={handleBrlAmountChange} placeholder="0,00" aria-describedby="exchange-rate-basis" />
                            </ConsultationField>
                        </div>
                        <p id="exchange-rate-basis" className="consultation-note">1 {quote.currency} = {formatRate(quote.sell)} pela cotação de venda.</p>
                    </form>
                )}
            </section>}
        </ConsultationPage>
    );
}
