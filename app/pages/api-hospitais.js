import { handleHospitalRequest } from "../services/hospitais-search.server.js";

export function loader({ request }) {
    return handleHospitalRequest(request);
}
