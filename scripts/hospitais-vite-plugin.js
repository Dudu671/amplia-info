import { gzipSync } from "node:zlib";
import { loadHospitalIndex } from "../app/services/hospitais-index.server.js";
import { updateHospitalIndex } from "./update-hospitais-index.js";

// O snapshot faz parte apenas do bundle do servidor, inclusive em funções sem disco persistente.
export function hospitaisIndexPlugin() {
    const moduleId = "virtual:hospitais-index";
    const resolvedId = `\0${moduleId}`;
    let building = false;
    let snapshot;

    async function prepareSnapshot() {
        let previous;
        try { previous = await loadHospitalIndex(); } catch { /* Primeira carga. */ }
        if (process.env.VERCEL === "1") {
            try { return await updateHospitalIndex(); }
            catch (error) {
                if (!previous) throw error;
                console.warn(`Atualização CNES falhou no build; tentando a última base válida: ${error.message}`);
            }
        }
        return previous || updateHospitalIndex();
    }

    return {
        name: "hospitais-server-index",
        configResolved(config) { building = config.command === "build"; },
        resolveId(id) {
            if (id === moduleId) return resolvedId;
        },
        async load(id) {
            if (id !== resolvedId) return;
            // Em desenvolvimento, o worker continua responsável pelo índice em disco.
            if (!building) return "export default null;";
            snapshot ??= prepareSnapshot();
            const index = await snapshot;
            const compressed = gzipSync(JSON.stringify(index)).toString("base64");
            return `import { gunzipSync } from "node:zlib";
                export default JSON.parse(gunzipSync(Buffer.from(${JSON.stringify(compressed)}, "base64")).toString("utf8"));`;
        },
    };
}
