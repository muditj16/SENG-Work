import {
  Briefcase,
  Calendar,
  Car,
  Clock,
  DollarSign,
  FileText,
  Home,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const CATEGORY_ITEMS = [
  { icon: Car, label: "Traffic", color: "#ef4444" },
  { icon: DollarSign, label: "Business", color: "#22c55e" },
  { icon: Users, label: "Community", color: "#3b82f6" },
  { icon: Home, label: "Property", color: "#f59e0b" },
  { icon: Briefcase, label: "Employment", color: "#8b5cf6" },
  { icon: Shield, label: "Safety", color: "#06b6d4" },
  { icon: FileText, label: "Permits", color: "#84cc16" },
  { icon: Calendar, label: "Events Calendar", color: "#f97316", isCalendar: true },
];

function SearchPage({ onCalendarClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load search history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (history) => {
    localStorage.setItem("searchHistory", JSON.stringify(history));
  };

  // Handle search submission
  const handleSearch = (query) => {
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory.slice(0, 4)]; // Keep only 5 recent searches
      setSearchHistory(newHistory);
      saveSearchHistory(newHistory);
    }
    setShowHistory(false);
    // Add your search logic here
    console.log("Searching for:", query);
  };

  // Handle selecting from history
  const handleHistorySelect = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
    setShowHistory(false);
  };

  const handleCategoryClick = (category) => {
    if (category.isCalendar) {
      onCalendarClick();
    } else {
      // Handle other category clicks
      console.log("Clicked category:", category.label);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Search Laws</h1>
      </div>

      <div className="container">
        {/* Category Grid */}
        <div className="category-grid">
          {CATEGORY_ITEMS.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div
                key={index}
                className="category-item"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-icon">
                  <IconComponent size={32} color={category.color} />
                </div>
                <span className="category-label">{category.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Bar at Bottom */}
      <div className="search-bar">
        <div className="search-input-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search for laws..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(searchQuery);
              }
            }}
          />
          <button
            className="history-icon-btn"
            onClick={() => setShowHistory(!showHistory)}
            title="Search History"
          >
            <Clock size={20} />
          </button>
        </div>

        {/* Search History Dropdown */}
        {showHistory && (
          <div className="search-history-dropdown">
            <div className="search-history-header">
              <span className="history-title">Recent Searches</span>
              {searchHistory.length > 0 && (
                <button 
                  className="clear-history-btn"
                  onClick={clearHistory}
                  title="Clear History"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {searchHistory.length > 0 ? (
              <div className="search-history-list">
                {searchHistory.map((query, index) => (
                  <div
                    key={index}
                    className="search-history-item"
                    onClick={() => handleHistorySelect(query)}
                  >
                    <Clock size={16} className="history-item-icon" />
                    <span className="history-query">{query}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-history">
                <Clock size={24} className="no-history-icon" />
                <p>No recent searches</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
