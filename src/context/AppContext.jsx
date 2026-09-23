import { useEffect, useState } from "react";

import { AppContext } from "./AppContextValue";

const STORAGE_KEY = "reepin_app_settings";

const defaultSettings = {
  profile: {
    name: "",
    role: "Business owner",
  },

  business: {
    name: "",
    phone: "",
    address: "",
  },

  currency: "₦",

  notifications: {
    enabled: true,
    type: "alert",
    frequency: "once",
    defaultLeadTime: "1day",
  },
};

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);

      if (!savedSettings) {
        return defaultSettings;
      }

      const parsedSettings = JSON.parse(savedSettings);

      /*
       * Merge saved settings with defaults.
       *
       * This is important because older Reepin data may still
       * contain notifications: true instead of the new object.
       */
      const savedNotifications =
        typeof parsedSettings.notifications === "object" &&
        parsedSettings.notifications !== null
          ? parsedSettings.notifications
          : {};

      return {
        ...defaultSettings,

        ...parsedSettings,

        profile: {
          ...defaultSettings.profile,
          ...parsedSettings.profile,
        },

        business: {
          ...defaultSettings.business,
          ...parsedSettings.business,
        },

        notifications: {
          ...defaultSettings.notifications,
          ...savedNotifications,
        },
      };
    } catch (error) {
      console.error("Failed to load app settings:", error);

      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save app settings:", error);
    }
  }, [settings]);

  const updateProfile = (updates) => {
    setSettings((currentSettings) => ({
      ...currentSettings,

      profile: {
        ...currentSettings.profile,
        ...updates,
      },
    }));
  };

  const updateBusiness = (updates) => {
    setSettings((currentSettings) => ({
      ...currentSettings,

      business: {
        ...currentSettings.business,
        ...updates,
      },
    }));
  };

  const updateCurrency = (currency) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      currency,
    }));
  };

  const updateNotifications = (updates) => {
    setSettings((currentSettings) => ({
      ...currentSettings,

      notifications: {
        ...currentSettings.notifications,
        ...updates,
      },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        settings,

        updateProfile,
        updateBusiness,
        updateCurrency,
        updateNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
