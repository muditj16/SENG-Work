import { ChevronDown, Filter } from "lucide-react";
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
    location: "Saanish",
  },
  {
    id: 2,
    category: "Business",
    title: "Business License Renewal",
    description:
      "Business licenses must be renewed annually before December 31st to avoid penalties.",
    location: "Sooke",
  },
  {
    id: 3,
    category: "Traffic",
    title: "School Zone Speed Limits",
    description:
      "Speed limit is reduced to 30 km/h in school zones during school hours (8 AM - 5 PM).",
    location: "Esquimalt",
  },
  {
    id: 4,
    category: "Cycling",
    title: "Bike Lane Usage Rules",
    description:
      "Motor vehicles are prohibited from stopping or parking in designated bike lanes.",
    location: "Saanish",
  },
  {
    id: 5,
    category: "Business",
    title: "Noise Bylaws for Businesses",
    description:
      "Commercial activities must not exceed 55 dB between 10 PM and 7 AM in residential areas.",
    location: "Sooke",
  },
];

function HomePage({ selectedLocation }) {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFeed, setSelectedFeed] = useState("Recent Laws");

  const filteredLaws = SAMPLE_LAWS.filter((law) => {
    const matchesLocation = law.location === selectedLocation;
    const matchesCategory =
      selectedCategory === "All" || law.category === selectedCategory;
    return matchesLocation && matchesCategory;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Local Law</h1>
        <p className="text-secondary text-sm" style={{ marginTop: "0.25rem" }}>
          {selectedLocation}
        </p>
      </div>

      <div className="container">
        {/* Feed Header with Filter */}
        <div className="feed-header">
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
            Laws in {selectedLocation}
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
              <label className="filter-label">Category</label>
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
              <label className="filter-label">Feed</label>
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
              <div key={law.id} className="law-card">
                <span className="law-category">{law.category}</span>
                <h3 className="law-title">{law.title}</h3>
                <p className="law-description">{law.description}</p>
              </div>
            ))
          ) : (
            <div className="law-card">
              <p className="law-description">
                No laws found for the selected filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
