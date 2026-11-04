//Contains text, images, and button code visible at top of Admin Dash
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
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
            <Link
                to="/welcome"
                className="admin-header-logo"
                aria-label="Go to the Compassionate home page"
            >
                <img
                    src={compassionateLogo}
                    alt="Compassionate Home Health and Hospice"
                />
            </Link>
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