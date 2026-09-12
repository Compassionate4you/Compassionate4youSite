import { useEffect } from "react";

export default function Scheduling() {
    useEffect(() => { /* loads Acuity's JavaScript */
        const script = document.createElement("script");
        script.src = "https://embed.acuityscheduling.com/js/embed.js";
        script.async = true; // Webpage can load without waiting for Acuity's JavaScript to download

        document.body.appendChild(script); // Adds the script to the body of the webpage

        return () => { // After user leaves the Scheduling Page the acuity script is removed from the body
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    return (
        // displays the Acuity scheduling page
        // iframe allows you to display another webpage inside your webpage
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