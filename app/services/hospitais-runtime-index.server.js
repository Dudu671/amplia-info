import { loadHospitalIndex, validateHospitalIndex } from "./hospitais-index.server.js";

let bundledIndex;

export async function loadRuntimeHospitalIndex(version) {
    try {
        return await loadHospitalIndex(version);
    } catch (error) {
        // A importação dinâmica mantém a base fora do navegador e só a carrega quando necessária.
        bundledIndex ??= import("virtual:hospitais-index")
            .then(({ default: index }) => index && validateHospitalIndex(index))
            .catch(() => null);
        const index = await bundledIndex;
        if (!index || (version && version !== index.version)) throw error;
        return index;
    }
}
