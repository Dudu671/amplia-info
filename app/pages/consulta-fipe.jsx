import { useEffect, useRef, useState } from "react";
import ConsultationPage from "../components/ConsultationPage";
import ConsultationForm from "../components/ConsultationForm";
import ConsultationField from "../components/ConsultationField";
import ConsultationResult from "../components/ConsultationResult";
import Dropdown from "../components/Dropdown";
import { formatModelYear, getPreco, listAnos, listMarcas, listModelos } from "../services/fipe";

const vehicleTypes = [
    { value: "carros", label: "Carros" },
    { value: "motos", label: "Motos" },
    { value: "caminhoes", label: "Caminhões" },
];

const emptyList = { items: [], status: "idle", attempt: 0 };

export function meta() {
    return [
        { title: "AmpliaInfo — Consulta FIPE" },
        { name: "description", content: "Consulte os preços médios de carros, motos e caminhões na tabela FIPE." },
    ];
}

export default function ConsultaFipe() {
    const requestRef = useRef(null);
    const [vehicleType, setVehicleType] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [brands, setBrands] = useState(emptyList);
    const [models, setModels] = useState(emptyList);
    const [years, setYears] = useState(emptyList);
    const [price, setPrice] = useState(null);
    const [priceStatus, setPriceStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => () => requestRef.current?.abort(), []);

    useEffect(() => {
        if (!vehicleType) return undefined;

        const controller = new AbortController();

        async function loadBrands() {
            try {
                const items = await listMarcas(vehicleType, controller.signal);
                if (controller.signal.aborted) return;
                setBrands((current) => ({ ...current, items, status: "success" }));
            } catch (error) {
                if (error.name === "AbortError" || controller.signal.aborted) return;
                setBrands((current) => ({ ...current, items: [], status: "error" }));
            }
        }

        loadBrands();
        return () => controller.abort();
    }, [vehicleType, brands.attempt]);

    useEffect(() => {
        if (!vehicleType || !brand) return undefined;

        const controller = new AbortController();

        async function loadModels() {
            try {
                const items = await listModelos(vehicleType, brand, controller.signal);
                if (controller.signal.aborted) return;
                setModels((current) => ({ ...current, items, status: "success" }));
            } catch (error) {
                if (error.name === "AbortError" || controller.signal.aborted) return;
                setModels((current) => ({ ...current, items: [], status: "error" }));
            }
        }

        loadModels();
        return () => controller.abort();
    }, [vehicleType, brand, models.attempt]);

    useEffect(() => {
        if (!vehicleType || !brand || !model) return undefined;

        const controller = new AbortController();

        async function loadYears() {
            try {
                const items = await listAnos(vehicleType, brand, model, controller.signal);
                if (controller.signal.aborted) return;
                setYears((current) => ({ ...current, items, status: "success" }));
            } catch (error) {
                if (error.name === "AbortError" || controller.signal.aborted) return;
                setYears((current) => ({ ...current, items: [], status: "error" }));
            }
        }

        loadYears();
        return () => controller.abort();
    }, [vehicleType, brand, model, years.attempt]);

    function clearPrice() {
        requestRef.current?.abort();
        setPrice(null);
        setPriceStatus("idle");
        setErrorMessage("");
    }

    function handleTypeChange(value) {
        clearPrice();
        if (value === vehicleType) {
            if (brands.status === "error") setBrands((current) => ({ ...current, status: "loading", attempt: current.attempt + 1 }));
            return;
        }
        setVehicleType(value);
        setBrand("");
        setBrands({ items: [], status: "loading", attempt: 0 });
        setModel("");
        setModels(emptyList);
        setYear("");
        setYears(emptyList);
    }

    function handleBrandChange(value) {
        clearPrice();
        if (value === brand) {
            if (models.status === "error") setModels((current) => ({ ...current, status: "loading", attempt: current.attempt + 1 }));
            return;
        }
        setBrand(value);
        setModel("");
        setModels({ items: [], status: "loading", attempt: 0 });
        setYear("");
        setYears(emptyList);
    }

    function handleModelChange(value) {
        clearPrice();
        if (value === model) {
            if (years.status === "error") setYears((current) => ({ ...current, status: "loading", attempt: current.attempt + 1 }));
            return;
        }
        setModel(value);
        setYear("");
        setYears({ items: [], status: "loading", attempt: 0 });
    }

    function handleYearChange(value) {
        clearPrice();
        setYear(value);
    }

    async function handleSubmit() {
        if (!vehicleType || !brand || !model || !year || priceStatus === "loading") return;

        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        setPriceStatus("loading");
        setPrice(null);
        setErrorMessage("");

        try {
            const result = await getPreco(vehicleType, brand, model, year, controller.signal);
            if (controller.signal.aborted) return;
            setPrice(result);
            setPriceStatus("success");
        } catch (error) {
            if (error.name === "AbortError" || controller.signal.aborted) return;
            setErrorMessage(error.message);
            setPriceStatus("error");
        }
    }

    function getBrandPlaceholder() {
        if (!vehicleType) return "Selecione primeiro o tipo de veículo";
        if (brands.status === "loading") return "Carregando marcas...";
        if (brands.status === "error") return "Não foi possível carregar as marcas";
        if (!brands.items.length) return "Nenhuma marca encontrada";
        return "Selecione a marca";
    }

    function getModelPlaceholder() {
        if (!brand) return "Selecione primeiro a marca";
        if (models.status === "loading") return "Carregando modelos...";
        if (models.status === "error") return "Não foi possível carregar os modelos";
        if (!models.items.length) return "Nenhum modelo encontrado";
        return "Selecione o modelo";
    }

    function getYearPlaceholder() {
        if (!model) return "Selecione primeiro o modelo";
        if (years.status === "loading") return "Carregando anos...";
        if (years.status === "error") return "Não foi possível carregar os anos";
        if (!years.items.length) return "Nenhum ano encontrado";
        return "Selecione o ano";
    }

    const selectedYear = years.items.find((option) => option.value === year);
    const listError = brands.status === "error"
        ? "Não foi possível carregar as marcas. Selecione o tipo de veículo novamente."
        : models.status === "error"
            ? "Não foi possível carregar os modelos. Selecione a marca novamente."
            : years.status === "error"
                ? "Não foi possível carregar os anos. Selecione o modelo novamente."
                : "";
    const canSubmit = Boolean(vehicleType && brand && model && year) && priceStatus !== "loading";

    return (
        <ConsultationPage title="Consulta FIPE" description="Consulte a tabela de preços médios de veículos com base nos dados oficiais atualizados."
            breadcrumbs={[{ label: "Financeiro", to: "/financeiro" }, { label: "Consulta FIPE" }]}>
            <ConsultationForm buttonLabel={priceStatus === "loading" ? "Consultando..." : "Consultar FIPE"} includeLgpd onSubmit={handleSubmit} disabled={!canSubmit}>
                <ConsultationField id="vehicle-type" label="Tipo de veículo">
                    <Dropdown id="vehicle-type" name="vehicleType" value={vehicleType} options={vehicleTypes}
                        placeholder="Selecione o tipo de veículo" onChange={handleTypeChange} />
                </ConsultationField>
                <ConsultationField id="vehicle-brand" label="Marca do veículo">
                    <Dropdown id="vehicle-brand" name="brand" value={brand} options={brands.items}
                        disabled={!vehicleType || brands.status !== "success" || !brands.items.length}
                        placeholder={getBrandPlaceholder()} onChange={handleBrandChange} />
                </ConsultationField>
                <ConsultationField id="vehicle-model" label="Modelo">
                    <Dropdown id="vehicle-model" name="model" value={model} options={models.items}
                        disabled={!brand || models.status !== "success" || !models.items.length}
                        placeholder={getModelPlaceholder()} onChange={handleModelChange} />
                </ConsultationField>
                <ConsultationField id="vehicle-year" label="Ano">
                    <Dropdown id="vehicle-year" name="year" value={year} options={years.items}
                        disabled={!model || years.status !== "success" || !years.items.length}
                        placeholder={getYearPlaceholder()} onChange={handleYearChange} />
                </ConsultationField>
            </ConsultationForm>
            {(listError || priceStatus === "loading" || priceStatus === "error" || price) && (
                <section className="consultation-results" aria-live="polite" aria-busy={priceStatus === "loading"}>
                    {listError && <p className="consultation-status consultation-status--error" role="alert">{listError}</p>}
                    {priceStatus === "loading" && <p className="consultation-status">Consultando a tabela FIPE...</p>}
                    {priceStatus === "error" && <p className="consultation-status consultation-status--error" role="alert">{errorMessage}</p>}
                    {price && (
                        <>
                            <ConsultationResult title={price.price} icon="/assets/financeiro/car.svg" details={[
                                { label: "Marca", value: price.brand },
                                { label: "Modelo", value: price.model },
                                { label: "Ano", value: formatModelYear(price.modelYear, selectedYear?.label) },
                                { label: "Combustível", value: price.fuel },
                                { label: "Código FIPE", value: price.fipeCode },
                                { label: "Referência", value: price.referenceMonth },
                            ]} />
                            <p className="consultation-note">Preço médio da tabela FIPE vigente, consultado pela Brasil API.</p>
                        </>
                    )}
                </section>
            )}
        </ConsultationPage>
    );
}
