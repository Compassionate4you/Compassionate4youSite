import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "./Calendar";
import "../styles/portal.css";

function SchedulePage({ onSubmit }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    serviceType: "",
    date: null,
    timeSlot: "",
    notes: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const timeSlots = [
    "8:00 AM - 9:00 AM",
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date || !formData.timeSlot) return;

    if (onSubmit) {
      onSubmit(formData);
    }

    setShowSuccess(true);
  };

  return (
    <div>
      {/* Navbar */}
      <div className="navbar">
        <div className="navbar-left">
          <div className="avatar">CH</div>
          <div>
            <div className="navbar-title">{t("portal.title")}</div>
            <div className="navbar-subtitle">{t("portal.welcome")}</div>
          </div>
        </div>
        <div className="navbar-right">
          <button>{t("nav.home")}</button>
          <button>{t("nav.logout")}</button>
        </div>
      </div>

      <div className="content">
        <button className="back-btn">
          {t("schedule.backToDashboard")}
        </button>

        <div className="section-box">
          <h2>{t("schedule.title")}</h2>
          <p className="desc">{t("schedule.subtitle")}</p>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="field">
              <label>{t("schedule.fullName")}</label>
              <input
                type="text"
                value={formData.fullName}
                placeholder={t("schedule.fullNamePlaceholder")}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            {/* Phone */}
            <div className="field">
              <label>{t("schedule.phone")}</label>
              <input
                type="tel"
                value={formData.phone}
                placeholder={t("schedule.phonePlaceholder")}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </div>

            {/* Email */}
            <div className="field">
              <label>{t("schedule.email")}</label>
              <input
                type="email"
                value={formData.email}
                placeholder={t("schedule.emailPlaceholder")}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            {/* Service Type */}
            <div className="field">
              <label>{t("schedule.serviceType")}</label>
              <select
                value={formData.serviceType}
                onChange={(e) =>
                  setFormData({ ...formData, serviceType: e.target.value })
                }
                required
              >
                <option value="">
                  {t("schedule.selectService")}
                </option>
                <option value="home-health">
                  {t("schedule.homeHealth")}
                </option>
                <option value="hospice">
                  {t("schedule.hospiceCare")}
                </option>
                <option value="consultation">
                  {t("schedule.generalConsultation")}
                </option>
              </select>
            </div>

            {/* Calendar */}
            <div className="field">
              <label>{t("schedule.preferredDate")}</label>
              <Calendar
                selected={formData.date}
                onSelect={(date) =>
                  setFormData({ ...formData, date })
                }
              />
            </div>

            {/* Time Slots */}
            {formData.date && (
              <div className="field">
                <label>{t("schedule.selectTime")}</label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeSlot: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    {t("schedule.selectTime")}
                  </option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="field">
              <label>{t("schedule.notes")}</label>
              <textarea
                value={formData.notes}
                placeholder={t("schedule.notesPlaceholder")}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            {/* Buttons */}
            <button
              className="btn-primary"
              type="submit"
              disabled={!formData.date || !formData.timeSlot}
            >
              {t("schedule.confirm")}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() =>
                setFormData({
                  fullName: "",
                  phone: "",
                  email: "",
                  serviceType: "",
                  date: null,
                  timeSlot: "",
                  notes: "",
                })
              }
            >
              {t("schedule.cancel")}
            </button>

            {/* Success Message */}
            {showSuccess && (
              <div className="success-msg">
                {t("schedule.successMsg")}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
