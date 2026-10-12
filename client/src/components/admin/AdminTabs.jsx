//Contains Appointments, Content, Locations, and Accounts tab code
import { useTranslation } from "react-i18next";

function AdminTabs({
    activeTab,
    onSelectTab,
    onOpenContent,
}) {
    const { t } = useTranslation();

    return (
        <nav
            className="admin-tabs"
            aria-label="Admin dashboard sections"
        >
            <button
                type="button"
                className={activeTab === "appointments" ? "active" : ""}
                onClick={() => onSelectTab("appointments")}
            >
                {t("admin.tabs.appointments")}
            </button>

            <button
                type="button"
                className={activeTab === "content" ? "active" : ""}
                onClick={onOpenContent}
            >
                {t("admin.tabs.content")}
            </button>

            <button
                type="button"
                className={activeTab === "locations" ? "active" : ""}
                onClick={() => onSelectTab("locations")}
            >
                {t("admin.tabs.locations")}
            </button>

            <button
                type="button"
                className={activeTab === "accounts" ? "active" : ""}
                onClick={() => onSelectTab("accounts")}
            >
                {t("admin.tabs.accounts")}
            </button>
        </nav>
    );
}

export default AdminTabs;