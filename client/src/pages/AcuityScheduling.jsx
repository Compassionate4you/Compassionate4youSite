import { useEffect } from "react";

export default function Scheduling() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://embed.acuityscheduling.com/js/embed.js";
        script.async = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <iframe
            src="https://app.acuityscheduling.com/schedule.php?owner=40275032&ref=embedded_csp"
            title="Schedule Appointment"
            width="100%"
            height="800"
            frameBorder="0"
            allow="payment"
        />
    );
}