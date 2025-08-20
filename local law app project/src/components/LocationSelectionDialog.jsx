import { MapPin, Search, X } from "lucide-react";
import { useState } from "react";

const LOCATIONS = ["Saanich", "Sooke", "Esquimalt"];

function LocationSelectionDialog({ onLocationSelect }) {
  const [searchInput, setSearchInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Filter locations based on search input
  const filteredLocations = LOCATIONS.filter((location) =>
    location.toLowerCase().startsWith(searchInput.toLowerCase())
  );

  const handleInputChange = (value) => {
    setSearchInput(value);
    setShowResults(value.length > 0);

    // If the input exactly matches a location, auto-select it
    const exactMatch = LOCATIONS.find(
      (location) => location.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setSelectedLocation(exactMatch);
    } else {
      setSelectedLocation("");
    }
  };

  const handleLocationClick = (location) => {
    setSearchInput(location);
    setSelectedLocation(location);
    setShowResults(false);
  };

  const handleContinue = () => {
    // Pass the selected location (could be empty string for no location)
    onLocationSelect(selectedLocation || null);
  };

  const handleSkip = () => {
    onLocationSelect(null);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSelectedLocation("");
    setShowResults(false);
  };

  return (
    <div className="location-dialog-overlay">
      <div className="location-dialog">
        <div className="location-dialog-content">
          <div className="location-dialog-header">
            <div className="location-icon">
              <MapPin size={48} color="var(--primary-color)" />
            </div>
            <h1 className="location-dialog-title">Welcome to Local Law</h1>
            <p className="location-dialog-description">
              Search for your location to get personalized local laws, or skip
              to browse all locations.
            </p>
          </div>

          <div className="location-search">
            <label className="location-search-label">
              Search for your location (optional):
            </label>
            <div className="location-search-container">
              <Search className="search-icon-dialog" size={20} />
              <input
                type="text"
                className="location-search-input"
                placeholder="Type your location..."
                value={searchInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowResults(searchInput.length > 0)}
              />
              {searchInput && (
                <button className="clear-search-btn" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Results */}
            {showResults && filteredLocations.length > 0 && (
              <div className="location-results">
                {filteredLocations.map((location) => (
                  <button
                    key={location}
                    className="location-result-item"
                    onClick={() => handleLocationClick(location)}
                  >
                    <MapPin size={16} color="var(--text-secondary)" />
                    <span>{location}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showResults &&
              filteredLocations.length === 0 &&
              searchInput.length > 0 && (
                <div className="location-results">
                  <div className="no-results">
                    <span className="text-secondary">
                      No locations found matching "{searchInput}"
                    </span>
                  </div>
                </div>
              )}

            {/* Selected Location Display */}
            {selectedLocation && (
              <div className="selected-location">
                <MapPin size={16} color="var(--primary-color)" />
                <span>
                  Selected: <strong>{selectedLocation}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="location-dialog-actions">
            <button className="btn btn-secondary" onClick={handleSkip}>
              Skip for now
            </button>
            <button className="btn btn-primary" onClick={handleContinue}>
              {selectedLocation ? "Continue" : "Browse All"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocationSelectionDialog;
