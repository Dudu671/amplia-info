export default function GeograficoNotice({ children, role = "status" }) {
    return <p className="consultation-notice" role={role}>{children}</p>;
}
