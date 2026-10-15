export default function ConsultationField({ id, label, icon, children }) {
    return (
        <div className="consultation-field">
            <label htmlFor={id}>{label}</label>
            {icon ? (
                <div className="consultation-input">
                    <span className="consultation-input__icon" aria-hidden="true">
                        <img src={icon} alt="" />
                    </span>
                    {children}
                </div>
            ) : children}
        </div>
    );
}
