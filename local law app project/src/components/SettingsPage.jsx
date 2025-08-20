import { useState } from "react";

const LOCATIONS = ["Saanich", "Sooke", "Esquimalt"];

function SettingsPage({ selectedLocation, onLocationChange }) {
  const [fontSize, setFontSize] = useState("medium");
  const [notifications, setNotifications] = useState("all");
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("english");
  const [autoUpdate, setAutoUpdate] = useState("enabled");

  const handleLocationChange = (newLocation) => {
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div className="container">
        <div className="settings-section">
          <div className="card">
            <div className="setting-item">
              <span className="setting-label">Current Location</span>
              <div className="setting-control">
                <select
                  value={selectedLocation || ""}
                  onChange={(e) => handleLocationChange(e.target.value || null)}
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">Font Size</span>
              <div className="setting-control">
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">Notifications</span>
              <div className="setting-control">
                <select
                  value={notifications}
                  onChange={(e) => setNotifications(e.target.value)}
                >
                  <option value="all">All Notifications</option>
                  <option value="important">Important Only</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">Theme</span>
              <div className="setting-control">
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">Language</span>
              <div className="setting-control">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="french">Français</option>
                  <option value="spanish">Español</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">Auto-Update Laws</span>
              <div className="setting-control">
                <select
                  value={autoUpdate}
                  onChange={(e) => setAutoUpdate(e.target.value)}
                >
                  <option value="enabled">Enabled</option>
                  <option value="wifi-only">Wi-Fi Only</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="card">
            <h3
              style={{
                marginBottom: "1rem",
                fontSize: "1.125rem",
                fontWeight: "600",
              }}
            >
              About
            </h3>

            <div className="setting-item">
              <span className="setting-label">Version</span>
              <span className="text-secondary">1.0.0</span>
            </div>

            <div className="setting-item">
              <span className="setting-label">Last Updated</span>
              <span className="text-secondary">December 2024</span>
            </div>

            <div className="setting-item">
              <span className="setting-label">Privacy Policy</span>
              <span
                className="text-secondary"
                style={{ cursor: "pointer", color: "var(--primary-color)" }}
              >
                View →
              </span>
            </div>

            <div className="setting-item">
              <span className="setting-label">Terms of Service</span>
              <span
                className="text-secondary"
                style={{ cursor: "pointer", color: "var(--primary-color)" }}
              >
                View →
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
