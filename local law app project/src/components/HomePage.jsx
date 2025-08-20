import { Calendar, ChevronDown, Filter, MapPin, Scale, X, Brain } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["All", "Cycling", "Business", "Traffic"];
const FEEDS = ["Recent Laws", "Popular Laws", "Updated Laws"];

// Sample law data
const SAMPLE_LAWS = [
  {
    id: 1,
    category: "Cycling",
    title: "Bicycle Helmet Requirements",
    description:
      "All cyclists under 18 must wear approved helmets when riding on public roads and bike paths.",
    location: "Saanich",
    effectiveDate: "January 1, 2023",
    penalty: "Fine of $29 for non-compliance",
    isAiTranslated: true,
    aiConfidence: 0.94,
    fullText:
      "According to Saanich Municipal Code Section 7.2, all cyclists under the age of 18 years must wear a properly fitted and fastened bicycle safety helmet that meets or exceeds the standards of the Canadian Standards Association (CSA), the Snell Memorial Foundation, or the American National Standards Institute (ANSI) when operating a bicycle on any public road, sidewalk, or bicycle path within municipal boundaries.",
    relatedLaws: ["Bicycle Operation Rules", "Child Safety Regulations"],
  },
  {
    id: 2,
    category: "Business",
    title: "Business License Renewal",
    description:
      "Business licenses must be renewed annually before December 31st to avoid penalties.",
    location: "Sooke",
    effectiveDate: "January 1, 2024",
    penalty: "Late fee of $50 plus 10% of license fee",
    isAiTranslated: false,
    fullText:
      "All business licenses issued by the District of Sooke must be renewed annually on or before December 31st of each year. Failure to renew by the deadline will result in automatic suspension of the license and additional fees. Businesses operating without a valid license may face prosecution under the Business License Bylaw.",
    relatedLaws: [
      "Business Operation Standards",
      "Commercial Zoning Requirements",
    ],
  },
  {
    id: 3,
    category: "Traffic",
    title: "School Zone Speed Limits",
    description:
      "Speed limit is reduced to 30 km/h in school zones during school hours (8 AM - 5 PM).",
    location: "Esquimalt",
    effectiveDate: "September 1, 2023",
    penalty:
      "Fine of $138 for speeds 31-40 km/h, higher fines for greater speeds",
    isAiTranslated: true,
    aiConfidence: 0.89,
    fullText:
      "Within designated school zones in the Township of Esquimalt, the maximum speed limit is 30 km/h during school days between the hours of 8:00 AM and 5:00 PM. School zones are clearly marked with appropriate signage. This reduced speed limit is in effect year-round during the specified hours, regardless of whether school is in session.",
    relatedLaws: ["Pedestrian Safety Regulations", "Traffic Control Measures"],
  },
  {
    id: 4,
    category: "Cycling",
    title: "Bike Lane Usage Rules",
    description:
      "Motor vehicles are prohibited from stopping or parking in designated bike lanes.",
    location: "Saanich",
    effectiveDate: "March 15, 2023",
    penalty: "Fine of $81 for unauthorized use of bike lane",
    isAiTranslated: true,
    aiConfidence: 0.97,
    fullText:
      "Motor vehicles, including motorcycles and mopeds, are strictly prohibited from driving, stopping, standing, or parking in designated bicycle lanes at any time. This includes temporary stops for loading, unloading, or passenger drop-off. Emergency vehicles responding to calls are exempt from this restriction.",
    relatedLaws: ["Bicycle Helmet Requirements", "Parking Regulations"],
  },
  {
    id: 5,
    category: "Business",
    title: "Noise Bylaws for Businesses",
    description:
      "Commercial activities must not exceed 55 dB between 10 PM and 7 AM in residential areas.",
    location: "Sooke",
    effectiveDate: "June 1, 2023",
    penalty: "Warning for first offense, $100 fine for subsequent violations",
    isAiTranslated: true,
    aiConfidence: 0.91,
    fullText:
      "Commercial establishments operating within or adjacent to residential zones must maintain noise levels below 55 decibels between 10:00 PM and 7:00 AM on all days. This includes but is not limited to: delivery activities, equipment operation, music, and ventilation systems. Measurements are taken at the property line of the nearest residential unit.",
    relatedLaws: ["Business License Renewal", "Residential Zoning Bylaws"],
  },
];

function HomePage({ selectedLocation }) {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFeed, setSelectedFeed] = useState("Recent Laws");
  const [selectedLaw, setSelectedLaw] = useState(null);

  const filteredLaws = SAMPLE_LAWS.filter((law) => {
    // If no location is selected, show all laws
    const matchesLocation =
      !selectedLocation || law.location === selectedLocation;
    const matchesCategory =
      selectedCategory === "All" || law.category === selectedCategory;
    return matchesLocation && matchesCategory;
  });

  const displayTitle = selectedLocation
    ? `Laws in ${selectedLocation}`
    : "All Local Laws";
  const headerSubtitle = selectedLocation || "All Locations";

  return (
    <div>
      <div className="page-header">
        <div className="header-logo-container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src="/src/assets/logo.svg" alt="Logo" className="header-logo" width="180" height="160" />
        </div>
        {selectedLocation && (
          <p className="text-secondary text-sm" style={{ marginTop: "0.25rem", textAlign: "center" }}>
            {headerSubtitle}
          </p>
        )}
      </div>

      <div className="container">

        {/* Feed Header with Filter */}
        <div className="feed-header">
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
            {displayTitle}
          </h2>
          <button
            className="filter-toggle"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter size={16} />
            Filter
            <ChevronDown
              size={16}
              style={{ transform: showFilter ? "rotate(180deg)" : "none" }}
            />
          </button>
        </div>

        {/* Filter Dropdown */}
        {showFilter && (
          <div className="filter-dropdown">
            <div className="filter-section">
              <label className="filter-label">Community Scope</label>
              <div className="filter-options">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    className={`filter-option ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <label className="filter-label">Content Type</label>
              <div className="filter-options">
                {FEEDS.map((feed) => (
                  <button
                    key={feed}
                    className={`filter-option ${
                      selectedFeed === feed ? "active" : ""
                    }`}
                    onClick={() => setSelectedFeed(feed)}
                  >
                    {feed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Law Feed */}
        <div className="law-feed">
          {filteredLaws.length > 0 ? (
            filteredLaws.map((law) => (
              <div
                key={law.id}
                className="law-card"
                onClick={() => setSelectedLaw(law)}
                style={{ cursor: "pointer" }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span className="law-category">{law.category}</span>
                  {!selectedLocation && (
                    <span
                      className="law-location"
                      style={{
                        background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                        color: "var(--text-secondary)",
                        padding: "0.4rem 1rem",
                        borderRadius: "16px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        border: "1px solid var(--border)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      📍 {law.location}
                    </span>
                  )}
                </div>
                <h3 className="law-title">{law.title}</h3>
                <p className="law-description">{law.description}</p>
                {law.isAiTranslated && (
                  <div className="ai-disclosure">
                    <Brain className="ai-icon" size={8} />
                    <span className="ai-text">AI</span>
                    <div className="ai-badge-tooltip">
                      Simplified from legal language using AI (Confidence: {Math.round(law.aiConfidence * 100)}%)
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="law-card" style={{ 
              textAlign: "center", 
              padding: "2rem",
              background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
              border: "2px dashed var(--border)"
            }}>
              <div style={{ 
                fontSize: "3rem", 
                marginBottom: "1rem",
                opacity: "0.5"
              }}>
                📋
              </div>
              <p className="law-description" style={{ 
                fontSize: "1rem",
                fontWeight: "500",
                color: "var(--text-secondary)"
              }}>
                No laws found for the selected filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Law Detail Modal */}
      {selectedLaw && (
        <div className="modal-overlay" onClick={() => setSelectedLaw(null)}>
          <div
            className="law-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with close button */}
            <div className="law-detail-header">
              <button
                className="close-button"
                onClick={() => setSelectedLaw(null)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Law content */}
            <div className="law-detail-content">
              <div className="law-detail-meta">
                <span className="law-category">{selectedLaw.category}</span>
                <div className="law-location-detail">
                  <MapPin size={14} />
                  {selectedLaw.location}
                </div>
                {selectedLaw.isAiTranslated && (
                  <div className="ai-disclosure" style={{ marginTop: '0.5rem', position: 'static', bottom: 'auto', right: 'auto' }}>
                    <Brain size={8} />
                    <span className="ai-text">AI</span>
                    <div className="ai-badge-tooltip">
                      Simplified from legal language using AI (Confidence: {Math.round(selectedLaw.aiConfidence * 100)}%)
                    </div>
                  </div>
                )}
              </div>

              <h1 className="law-detail-title">{selectedLaw.title}</h1>

              <div className="law-detail-info">
                <div className="info-item">
                  <Calendar size={16} />
                  <div>
                    <span className="info-label">Effective Date</span>
                    <span className="info-value">
                      {selectedLaw.effectiveDate}
                    </span>
                  </div>
                </div>

                <div className="info-item">
                  <Scale size={16} />
                  <div>
                    <span className="info-label">Penalty</span>
                    <span className="info-value">{selectedLaw.penalty}</span>
                  </div>
                </div>
              </div>

              <div className="law-section">
                <h3>Full Text</h3>
                {selectedLaw.isAiTranslated && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(37, 99, 235, 0.05))',
                    border: '1px solid rgba(124, 58, 237, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <Brain size={16} color="#7c3aed" />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <strong style={{ color: '#7c3aed' }}>AI Translation Notice:</strong> This content has been simplified from complex legal language using artificial intelligence to improve readability. The original legal text remains authoritative for all legal purposes.
                    </div>
                  </div>
                )}
                <p className="law-full-text">{selectedLaw.fullText}</p>
              </div>

              <div className="law-section">
                <h3>Related Laws</h3>
                <div className="related-laws">
                  {selectedLaw.relatedLaws.map((relatedLaw, index) => (
                    <span key={index} className="related-law-tag">
                      {relatedLaw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
