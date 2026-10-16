import { useEffect, useState } from "react";
import { getCitiesByState } from "../services/cidades";

export default function useCities(state) {
    const [result, setResult] = useState({ state: "", cities: [], status: "idle" });

    useEffect(() => {
        if (!state) return;

        const controller = new AbortController();

        async function loadCities() {
            try {
                const cities = await getCitiesByState(state, controller.signal);
                if (controller.signal.aborted) return;
                setResult({ state, cities, status: "success" });
            } catch {
                if (controller.signal.aborted) return;
                setResult({ state, cities: [], status: "error" });
            }
        }

        loadCities();
        return () => controller.abort();
    }, [state]);

    if (!state) return { cities: [], status: "idle" };
    if (result.state !== state) return { cities: [], status: "loading" };
    return { cities: result.cities, status: result.status };
}
