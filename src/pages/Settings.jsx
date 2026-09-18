import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/AppContext";

import "./pages-css/Settings.css";

const Settings = () => {
  const navigate = useNavigate();

  const {
    settings,
    updateProfile,
    updateBusiness,
    updateCurrency,
    updateNotifications,
  } = useApp();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [isEditingNotifications, setIsEditingNotifications] = useState(false);
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);

  const [profileName, setProfileName] = useState(settings.profile.name);
  const [profileRole, setProfileRole] = useState(settings.profile.role);

  const [businessName, setBusinessName] = useState(settings.business.name);
  const [businessPhone, setBusinessPhone] = useState(settings.business.phone);
  const [businessAddress, setBusinessAddress] = useState(
    settings.business.address,
  );

  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);

  const [notificationEnabled, setNotificationEnabled] = useState(
    settings.notifications.enabled,
  );
  const [notificationType, setNotificationType] = useState(
    settings.notifications.type,
  );
  const [notificationFrequency, setNotificationFrequency] = useState(
    settings.notifications.frequency,
  );
  const [defaultLeadTime, setDefaultLeadTime] = useState(
    settings.notifications.defaultLeadTime,
  );

  // ---------------------------------------------------------
  // PROFILE
  // ---------------------------------------------------------

  const handleEditProfile = () => {
    setProfileName(settings.profile.name);
    setProfileRole(settings.profile.role);
    setIsEditingProfile(true);
  };

  const handleCancelProfile = () => {
    setProfileName(settings.profile.name);
    setProfileRole(settings.profile.role);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();

    updateProfile({
      name: profileName.trim(),
      role: profileRole.trim(),
    });

    setIsEditingProfile(false);
  };

  // ---------------------------------------------------------
  // BUSINESS
  // ---------------------------------------------------------

  const handleEditBusiness = () => {
    setBusinessName(settings.business.name);
    setBusinessPhone(settings.business.phone);
    setBusinessAddress(settings.business.address);

    setIsEditingBusiness(true);
    setIsEditingCurrency(false);
  };

  const handleCancelBusiness = () => {
    setBusinessName(settings.business.name);
    setBusinessPhone(settings.business.phone);
    setBusinessAddress(settings.business.address);

    setIsEditingBusiness(false);
  };

  const handleSaveBusiness = (event) => {
    event.preventDefault();

    updateBusiness({
      name: businessName.trim(),
      phone: businessPhone.trim(),
      address: businessAddress.trim(),
    });

    setIsEditingBusiness(false);
  };

  // ---------------------------------------------------------
  // CURRENCY
  // ---------------------------------------------------------

  const handleEditCurrency = () => {
    setSelectedCurrency(settings.currency);

    setIsEditingCurrency(true);
    setIsEditingBusiness(false);
  };

  const handleCancelCurrency = () => {
    setSelectedCurrency(settings.currency);
    setIsEditingCurrency(false);
  };

  const handleSaveCurrency = (event) => {
    event.preventDefault();

    updateCurrency(selectedCurrency);

    setIsEditingCurrency(false);
  };

  // ---------------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------------

  const handleEditNotifications = () => {
    setNotificationEnabled(settings.notifications.enabled);
    setNotificationType(settings.notifications.type);
    setNotificationFrequency(settings.notifications.frequency);
    setDefaultLeadTime(settings.notifications.defaultLeadTime);

    setIsEditingNotifications(true);
  };

  const handleCancelNotifications = () => {
    setNotificationEnabled(settings.notifications.enabled);
    setNotificationType(settings.notifications.type);
    setNotificationFrequency(settings.notifications.frequency);
    setDefaultLeadTime(settings.notifications.defaultLeadTime);

    setIsEditingNotifications(false);
  };

  const handleSaveNotifications = (event) => {
    event.preventDefault();

    updateNotifications({
      enabled: notificationEnabled,
      type: notificationType,
      frequency: notificationFrequency,
      defaultLeadTime,
    });

    setIsEditingNotifications(false);
  };

  // ---------------------------------------------------------
  // LOG OUT
  // ---------------------------------------------------------

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <main className="settings-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="settings-header">
        <div>
          <p className="settings-eyebrow">ACCOUNT</p>
          <h1>Settings</h1>
          <p className="settings-subtitle">
            Manage your Reepin preferences and business details.
          </p>
        </div>
      </header>

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <section className="settings-section">
        <p className="settings-section-label">PROFILE</p>

        {!isEditingProfile ? (
          <div className="settings-list-card">
            <button
              type="button"
              className="settings-list-item"
              onClick={handleEditProfile}
            >
              <div className="settings-item-icon">FP</div>

              <div className="settings-item-content">
                <strong>{settings.profile.name}</strong>
                <span>{settings.profile.role}</span>
              </div>

              <span className="settings-item-arrow">›</span>
            </button>
          </div>
        ) : (
          <form
            className="settings-profile-edit-card"
            onSubmit={handleSaveProfile}
          >
            <div className="settings-profile-edit-header">
              <div className="settings-item-icon">FP</div>

              <div>
                <strong>Edit profile</strong>
                <span>Update your personal information.</span>
              </div>
            </div>

            <div className="settings-form-field">
              <label htmlFor="profile-name">Name</label>

              <input
                id="profile-name"
                type="text"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="settings-form-field">
              <label htmlFor="profile-role">Role</label>

              <input
                id="profile-role"
                type="text"
                value={profileRole}
                onChange={(event) => setProfileRole(event.target.value)}
                placeholder="Business owner"
              />
            </div>

            <div className="settings-profile-actions">
              <button
                type="button"
                className="settings-cancel-button"
                onClick={handleCancelProfile}
              >
                Cancel
              </button>

              <button type="submit" className="settings-save-button">
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =====================================================
          BUSINESS
      ===================================================== */}

      <section className="settings-section">
        <p className="settings-section-label">BUSINESS</p>

        {!isEditingBusiness && !isEditingCurrency ? (
          <div className="settings-list-card">
            <button
              type="button"
              className="settings-list-item"
              onClick={handleEditBusiness}
            >
              <div className="settings-item-icon">⌂</div>

              <div className="settings-item-content">
                <strong>Business information</strong>

                <span>
                  {settings.business.name
                    ? settings.business.name
                    : "Add your business details"}
                </span>
              </div>

              <span className="settings-item-arrow">›</span>
            </button>

            <button
              type="button"
              className="settings-list-item"
              onClick={handleEditCurrency}
            >
              <div className="settings-item-icon">₦</div>

              <div className="settings-item-content">
                <strong>Currency</strong>

                <span>
                  {settings.currency === "₦"
                    ? "Nigerian Naira (₦)"
                    : settings.currency}
                </span>
              </div>

              <span className="settings-item-arrow">›</span>
            </button>
          </div>
        ) : isEditingBusiness ? (
          <form
            className="settings-business-edit-card"
            onSubmit={handleSaveBusiness}
          >
            <div className="settings-business-edit-header">
              <div className="settings-item-icon">⌂</div>

              <div>
                <strong>Business information</strong>
                <span>
                  Add the details Reepin should use for your business.
                </span>
              </div>
            </div>

            <div className="settings-form-field">
              <label htmlFor="business-name">Business name</label>

              <input
                id="business-name"
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="Your business name"
              />
            </div>

            <div className="settings-form-field">
              <label htmlFor="business-phone">Business phone</label>

              <input
                id="business-phone"
                type="tel"
                value={businessPhone}
                onChange={(event) => setBusinessPhone(event.target.value)}
                placeholder="08012345678"
              />
            </div>

            <div className="settings-form-field">
              <label htmlFor="business-address">Business address</label>

              <textarea
                id="business-address"
                value={businessAddress}
                onChange={(event) => setBusinessAddress(event.target.value)}
                placeholder="Business address"
                rows="3"
              />
            </div>

            <div className="settings-profile-actions">
              <button
                type="button"
                className="settings-cancel-button"
                onClick={handleCancelBusiness}
              >
                Cancel
              </button>

              <button type="submit" className="settings-save-button">
                Save changes
              </button>
            </div>
          </form>
        ) : (
          <form
            className="settings-business-edit-card"
            onSubmit={handleSaveCurrency}
          >
            <div className="settings-business-edit-header">
              <div className="settings-item-icon">₦</div>

              <div>
                <strong>Currency</strong>

                <span>Choose the currency Reepin uses for your business.</span>
              </div>
            </div>

            <div className="settings-form-field">
              <label htmlFor="currency">Business currency</label>

              <select
                id="currency"
                value={selectedCurrency}
                onChange={(event) => setSelectedCurrency(event.target.value)}
              >
                <option value="₦">Nigerian Naira (₦)</option>

                <option value="$">US Dollar ($)</option>

                <option value="£">British Pound (£)</option>

                <option value="€">Euro (€)</option>
              </select>
            </div>

            <div className="settings-profile-actions">
              <button
                type="button"
                className="settings-cancel-button"
                onClick={handleCancelCurrency}
              >
                Cancel
              </button>

              <button type="submit" className="settings-save-button">
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =====================================================
          PREFERENCES
      ===================================================== */}

      <section className="settings-section">
        <p className="settings-section-label">PREFERENCES</p>

        {!isEditingNotifications ? (
          <div className="settings-list-card">
            <button
              type="button"
              className="settings-list-item"
              onClick={handleEditNotifications}
            >
              <div className="settings-item-icon">◷</div>

              <div className="settings-item-content">
                <strong>Notifications</strong>

                <span>
                  {settings.notifications.enabled
                    ? "Follow-up reminders enabled"
                    : "Notifications disabled"}
                </span>
              </div>

              <span className="settings-item-arrow">›</span>
            </button>
          </div>
        ) : (
          <form
            className="settings-business-edit-card"
            onSubmit={handleSaveNotifications}
          >
            <div className="settings-business-edit-header">
              <div className="settings-item-icon">◷</div>

              <div>
                <strong>Notifications</strong>

                <span>Control how Reepin reminds you about follow-ups.</span>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-content">
                <strong>Follow-up reminders</strong>

                <span>Receive reminders for scheduled follow-ups.</span>
              </div>

              <button
                type="button"
                className={
                  notificationEnabled
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={() =>
                  setNotificationEnabled((currentValue) => !currentValue)
                }
                aria-pressed={notificationEnabled}
              >
                <span className="settings-toggle-knob" />
              </button>
            </div>

            <div className="settings-form-field">
              <label htmlFor="notification-type">Reminder type</label>

              <select
                id="notification-type"
                value={notificationType}
                onChange={(event) => setNotificationType(event.target.value)}
                disabled={!notificationEnabled}
              >
                <option value="alert">In-app alert</option>
              </select>
            </div>

            <div className="settings-form-field">
              <label htmlFor="notification-frequency">Frequency</label>

              <select
                id="notification-frequency"
                value={notificationFrequency}
                onChange={(event) =>
                  setNotificationFrequency(event.target.value)
                }
                disabled={!notificationEnabled}
              >
                <option value="once">Once</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div className="settings-form-field">
              <label htmlFor="default-lead-time">Default reminder time</label>

              <select
                id="default-lead-time"
                value={defaultLeadTime}
                onChange={(event) => setDefaultLeadTime(event.target.value)}
                disabled={!notificationEnabled}
              >
                <option value="sameDay">Same day</option>

                <option value="1hour">1 hour before</option>

                <option value="1day">1 day before</option>

                <option value="2days">2 days before</option>
              </select>
            </div>

            <div className="settings-profile-actions">
              <button
                type="button"
                className="settings-cancel-button"
                onClick={handleCancelNotifications}
              >
                Cancel
              </button>

              <button type="submit" className="settings-save-button">
                Save changes
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =====================================================
          ACCOUNT
      ===================================================== */}

      <section className="settings-section">
        <p className="settings-section-label">ACCOUNT</p>

        <div className="settings-list-card">
          <button
            type="button"
            className="settings-list-item settings-danger-item"
            onClick={handleLogout}
          >
            <div className="settings-item-icon">↪</div>

            <div className="settings-item-content">
              <strong>Log out</strong>

              <span>Return to the Reepin login screen.</span>
            </div>

            <span className="settings-item-arrow">›</span>
          </button>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="settings-footer">
        <strong>Reepin</strong>
        <span>Version 1.0.0 © franqphoenix</span>
      </footer>
    </main>
  );
};

export default Settings;
