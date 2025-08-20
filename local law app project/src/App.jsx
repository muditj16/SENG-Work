import { Gamepad2, Home, Search, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import CalendarModal from "./components/CalendarModal";
import GamePage from "./components/GamePage";
import HomePage from "./components/HomePage";
import LocationSelectionDialog from "./components/LocationSelectionDialog";
import SearchPage from "./components/SearchPage";
import SettingsPage from "./components/SettingsPage";

function TabNavigation() {
  const location = useLocation();

  const tabs = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/game", icon: Gamepad2, label: "Game" },
    { path: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  return (
    <nav className="tab-navigation">
      {tabs.map(({ path, icon: Icon, label }) => (
        <Link
          key={path}
          to={path}
          className={`tab-item ${location.pathname === path ? "active" : ""}`}
        >
          <Icon size={24} />
          <span className="tab-label">{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setHasCompletedOnboarding(true);
  };

  // Show location selection dialog if onboarding hasn't been completed
  if (!hasCompletedOnboarding) {
    return <LocationSelectionDialog onLocationSelect={handleLocationSelect} />;
  }

  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<HomePage selectedLocation={selectedLocation} />}
            />
            <Route
              path="/search"
              element={
                <SearchPage onCalendarClick={() => setIsCalendarOpen(true)} />
              }
            />
            <Route path="/game" element={<GamePage />} />
            <Route
              path="/settings"
              element={
                <SettingsPage
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                />
              }
            />
          </Routes>
        </main>
        <TabNavigation />

        {isCalendarOpen && (
          <CalendarModal onClose={() => setIsCalendarOpen(false)} />
        )}
      </div>
    </Router>
  );
}

export default App;
