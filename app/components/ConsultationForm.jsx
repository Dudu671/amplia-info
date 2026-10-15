export default function ConsultationForm({ children, buttonLabel, onSubmit, includeLgpd = false }) {
    function handleSubmit(event) {
        event.preventDefault();
        onSubmit?.(event);
    }

    return (
        <form className="consultation-form" onSubmit={handleSubmit}>
            {children}
            <button className="consultation-submit" type="submit">{buttonLabel}</button>
            <div className="consultation-form__divider" aria-hidden="true" />
            <p className="consultation-security">
                <span className="consultation-security__icon" aria-hidden="true">
                    <img src="/assets/consultation/security-lock.svg" alt="" />
                </span>
                <span>
                    Ambiente seguro de criptografia ponta a ponta em conformidade com o marco civil da internet{includeLgpd ? " e LGPD." : "."}
                </span>
            </p>
        </form>
    );
}
