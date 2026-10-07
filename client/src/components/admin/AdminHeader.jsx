//Contains text, images, and button code visible at top of Admin Dash
import { useTranslation } from "react-i18next";
import compassionateLogo from "../../assets/images/CompassionateLogo.jpeg";

function AdminHeader({ onLogout }) {
    const { t } = useTranslation();

    return (
        <header className="topbar">
            <div className="admin-identity">
                <div className="admin-avatar">AD</div>
                {/** Welcome text */}
                <div className="header-text">
                    <h1>{t("admin.title")}</h1>
                    <p>{t("admin.welcome")}</p>
                </div>
            </div>
            {/* Logo */}
            <div className="admin-header-logo">
                <img
                    src={compassionateLogo}
                    alt="Compassionate Home Health and Hospice"
                />
            </div>
            {/* Logout Button */}
            <div className="top-actions">
                <button
                    type="button"
                    className="logout-button"
                    onClick={onLogout}
                >
                    {t("nav.logout")}
                </button>
            </div>
        </header>
    );
}

export default AdminHeader;