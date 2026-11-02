import { searchHospitais } from "./hospitais.js";
import { HOSPITAIS_ERROR, HOSPITAIS_UNAVAILABLE, mergeHospitals } from "./hospitais-domain.js";

export const initialHospitalSearch = {
    items: [], status: "idle", loadingMore: false, error: "", nextCursor: null, indexDate: null,
};

export function createHospitalSearch(search = searchHospitais) {
    let state = initialHospitalSearch;
    let submitted = null;
    let controller;
    let sequence = 0;
    const listeners = new Set();
    function publish(change) {
        state = { ...state, ...change };
        for (const listener of listeners) listener();
    }

    async function load(filters, more) {
        if (more && (!state.nextCursor || state.loadingMore || state.status === "loading")) return;
        if (!more && state.status === "loading" && JSON.stringify(filters) === JSON.stringify(submitted)) return;
        controller?.abort();
        controller = new AbortController();
        const signal = controller.signal;
        const request = ++sequence;
        const cursor = more ? state.nextCursor : undefined;
        if (more) publish({ loadingMore: true, error: "" });
        else {
            submitted = { ...filters };
            publish({ ...initialHospitalSearch, status: "loading" });
        }
        try {
            const result = await search({ ...submitted }, { cursor, signal });
            if (signal.aborted || request !== sequence) return;
            publish({ items: mergeHospitals(more ? state.items : [], result.items), status: "success", loadingMore: false,
                error: "", nextCursor: result.nextCursor, indexDate: result.indexDate });
        } catch (error) {
            if (signal.aborted || request !== sequence || error.name === "AbortError") return;
            publish({ status: "error", loadingMore: false,
                error: error.message === HOSPITAIS_UNAVAILABLE ? HOSPITAIS_UNAVAILABLE : HOSPITAIS_ERROR });
        }
    }

    return {
        getSnapshot: () => state,
        subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
        submit: (filters) => load(filters, false),
        loadMore: () => load(submitted, true),
        cancel: () => { sequence++; controller?.abort(); },
    };
}
