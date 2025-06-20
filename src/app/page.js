"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Sun,
  Moon,
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  AlertCircle,
  Loader2,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";

// OpenWeatherMap API Configuration
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
const WEATHER_API_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Weather-based background configurations
const getWeatherBackground = (
  weatherCondition,
  isDarkMode,
  isNight = false
) => {
  const condition = weatherCondition?.toLowerCase() || "";

  // Check for various weather conditions
  if (condition.includes("clear") || condition.includes("sunny")) {
    return isDarkMode
      ? isNight
        ? "bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900"
        : "bg-gradient-to-br from-gray-900 via-blue-950 to-indigo-950"
      : "bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400";
  }

  if (condition.includes("cloud") || condition.includes("overcast")) {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900"
      : "bg-gradient-to-br from-gray-400 via-slate-500 to-gray-600";
  }

  if (
    condition.includes("rain") ||
    condition.includes("drizzle") ||
    condition.includes("shower")
  ) {
    return isDarkMode
      ? "bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-950"
      : "bg-gradient-to-br from-blue-600 via-slate-600 to-gray-700";
  }

  if (condition.includes("thunderstorm") || condition.includes("storm")) {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-950"
      : "bg-gradient-to-br from-purple-700 via-slate-700 to-gray-800";
  }

  if (condition.includes("snow") || condition.includes("blizzard")) {
    return isDarkMode
      ? "bg-gradient-to-br from-slate-700 via-blue-800 to-slate-900"
      : "bg-gradient-to-br from-blue-200 via-slate-300 to-blue-400";
  }

  if (
    condition.includes("mist") ||
    condition.includes("fog") ||
    condition.includes("haze")
  ) {
    return isDarkMode
      ? "bg-gradient-to-br from-gray-700 via-slate-800 to-gray-900"
      : "bg-gradient-to-br from-gray-300 via-slate-400 to-gray-500";
  }

  if (condition.includes("wind") || condition.includes("gust")) {
    return isDarkMode
      ? "bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900"
      : "bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500";
  }

  // Default backgrounds
  return isDarkMode
    ? "bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950"
    : "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600";
};

// Get weather-based animated elements
const getWeatherAnimations = (weatherCondition, isDarkMode) => {
  const condition = weatherCondition?.toLowerCase() || "";

  if (condition.includes("clear") || condition.includes("sunny")) {
    return {
      primary: isDarkMode ? "bg-yellow-400" : "bg-yellow-200",
      secondary: isDarkMode ? "bg-orange-400" : "bg-orange-200",
      accent: isDarkMode ? "bg-amber-400" : "bg-amber-200",
    };
  }

  if (condition.includes("rain") || condition.includes("storm")) {
    return {
      primary: isDarkMode ? "bg-blue-500" : "bg-blue-300",
      secondary: isDarkMode ? "bg-cyan-500" : "bg-cyan-300",
      accent: isDarkMode ? "bg-indigo-500" : "bg-indigo-300",
    };
  }

  if (condition.includes("snow")) {
    return {
      primary: isDarkMode ? "bg-blue-200" : "bg-white",
      secondary: isDarkMode ? "bg-slate-300" : "bg-gray-100",
      accent: isDarkMode ? "bg-cyan-200" : "bg-blue-100",
    };
  }

  if (condition.includes("cloud")) {
    return {
      primary: isDarkMode ? "bg-gray-400" : "bg-gray-200",
      secondary: isDarkMode ? "bg-slate-400" : "bg-slate-200",
      accent: isDarkMode ? "bg-zinc-400" : "bg-zinc-200",
    };
  }

  // Default
  return {
    primary: isDarkMode ? "bg-purple-500" : "bg-white",
    secondary: isDarkMode ? "bg-indigo-500" : "bg-blue-200",
    accent: isDarkMode ? "bg-blue-500" : "bg-indigo-200",
  };
};

// Check if it's night time based on current time and sunrise/sunset
const isNightTime = (sunriseTime, sunsetTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Convert sunrise/sunset times to minutes (assuming format like "6:30 AM")
  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
    if (period === "AM" && hours === 12) totalMinutes = minutes;
    return totalMinutes;
  };

  if (sunriseTime && sunsetTime) {
    const sunrise = parseTime(sunriseTime);
    const sunset = parseTime(sunsetTime);
    return currentTime < sunrise || currentTime > sunset;
  }

  // Fallback: consider night if between 6 PM and 6 AM
  return currentTime < 6 * 60 || currentTime > 18 * 60;
};

// OpenWeatherMap API integration
const fetchWeather = async (city) => {
  try {
    // Get current weather data
    const currentWeatherResponse = await fetch(
      `${WEATHER_API_BASE_URL}/weather?q=${encodeURIComponent(
        city
      )}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!currentWeatherResponse.ok) {
      if (currentWeatherResponse.status === 404) {
        throw new Error(
          "City not found. Please check the spelling and try again."
        );
      } else if (currentWeatherResponse.status === 401) {
        throw new Error("Weather service unavailable. Please try again later.");
      } else {
        throw new Error("Failed to fetch weather data. Please try again.");
      }
    }

    const currentWeather = await currentWeatherResponse.json();

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `${WEATHER_API_BASE_URL}/forecast?q=${encodeURIComponent(
        city
      )}&appid=${WEATHER_API_KEY}&units=metric`
    );

    let forecastData = null;
    if (forecastResponse.ok) {
      forecastData = await forecastResponse.json();
    }

    // Convert OpenWeatherMap data to our expected format
    const weatherData = {
      location: {
        name: currentWeather.name,
        country: currentWeather.sys.country,
        region: currentWeather.sys.country,
      },
      current: {
        temp_c: Math.round(currentWeather.main.temp),
        temp_f: Math.round((currentWeather.main.temp * 9) / 5 + 32),
        condition: {
          text:
            currentWeather.weather[0].description.charAt(0).toUpperCase() +
            currentWeather.weather[0].description.slice(1),
          icon: currentWeather.weather[0].icon,
        },
        humidity: currentWeather.main.humidity,
        wind_kph: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
        wind_mph: Math.round(currentWeather.wind.speed * 2.237), // Convert m/s to mph
        wind_dir: getWindDirection(currentWeather.wind.deg),
        pressure_mb: currentWeather.main.pressure,
        visibility_km: currentWeather.visibility
          ? Math.round(currentWeather.visibility / 1000)
          : 10,
        uv: 0, // OpenWeatherMap doesn't provide UV in basic plan
        feelslike_c: Math.round(currentWeather.main.feels_like),
        feelslike_f: Math.round((currentWeather.main.feels_like * 9) / 5 + 32),
      },
      forecast: forecastData
        ? {
            forecastday: [
              {
                date: new Date().toISOString().split("T")[0],
                day: {
                  maxtemp_c: Math.round(currentWeather.main.temp_max),
                  maxtemp_f: Math.round(
                    (currentWeather.main.temp_max * 9) / 5 + 32
                  ),
                  mintemp_c: Math.round(currentWeather.main.temp_min),
                  mintemp_f: Math.round(
                    (currentWeather.main.temp_min * 9) / 5 + 32
                  ),
                  condition: {
                    text: currentWeather.weather[0].description,
                    icon: currentWeather.weather[0].icon,
                  },
                },
              },
            ],
          }
        : null,
      astronomy: {
        astro: {
          sunrise: formatTime(
            currentWeather.sys.sunrise,
            currentWeather.timezone
          ),
          sunset: formatTime(
            currentWeather.sys.sunset,
            currentWeather.timezone
          ),
        },
      },
    };

    return weatherData;
  } catch (error) {
    console.error("Weather API Error:", error);
    throw error;
  }
};

// Helper function to convert wind degree to direction
const getWindDirection = (degrees) => {
  if (!degrees && degrees !== 0) return "N/A";

  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

// Helper function to format Unix timestamp to readable time
const formatTime = (timestamp, timezone) => {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
};

// Theme Context
const ThemeContext = React.createContext();
const useTheme = () => React.useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("weatherapp-theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      // Check system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("weatherapp-theme", newTheme ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme options for customization
const THEME_OPTIONS = [
  { name: "Default", value: "default" },
  { name: "Ocean", value: "ocean" },
  { name: "Sunset", value: "sunset" },
  { name: "Forest", value: "forest" },
  { name: "Rose", value: "rose" },
];

// Theme selector component
const ThemeSelector = ({ selected, onChange, isDarkMode }) => (
  <div className="flex gap-2 items-center justify-center mb-4">
    <span
      className={`text-xs font-semibold ${
        isDarkMode ? "text-gray-400" : "text-gray-600"
      }`}
    >
      Theme:
    </span>
    {THEME_OPTIONS.map((theme) => (
      <button
        key={theme.value}
        onClick={() => onChange(theme.value)}
        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 ${
          selected === theme.value
            ? isDarkMode
              ? "bg-purple-900/30 border-purple-400 text-purple-300"
              : "bg-blue-100 border-blue-400 text-blue-700"
            : isDarkMode
            ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
        }`}
      >
        {theme.name}
      </button>
    ))}
  </div>
);

// Advanced SearchBar Component with Enhanced Features
const SearchBar = ({
  city,
  setCity,
  onSearch,
  loading = false,
  placeholder = "Enter city name...",
  className = "",
  disabled = false,
  onLocationDetect = null,
  recentSearches = [],
  onClearHistory = null,
  showSuggestions = true,
}) => {
  const { isDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState(recentSearches);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [searchMode, setSearchMode] = useState("city"); // 'city' or 'coordinates'
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const searchBarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Popular cities for suggestions
  const popularCities = [
    "London",
    "New York",
    "Tokyo",
    "Paris",
    "Sydney",
    "Mumbai",
    "Berlin",
    "Toronto",
    "Dubai",
    "Singapore",
    "Hong Kong",
    "Los Angeles",
    "Madrid",
    "Rome",
    "Bangkok",
  ];

  // Auto-complete suggestions based on input
  useEffect(() => {
    if (city.length >= 2) {
      const filtered = popularCities
        .filter(
          (cityName) =>
            cityName.toLowerCase().includes(city.toLowerCase()) &&
            cityName.toLowerCase() !== city.toLowerCase()
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowDropdown(filtered.length > 0 || searchHistory.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(searchHistory.length > 0 && city.length === 0);
    }
  }, [city, searchHistory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Enhanced key handling
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && city.trim()) {
      e.preventDefault();
      handleSearch();
      setShowDropdown(false);
    }
    if (e.key === "Escape") {
      setCity("");
      setShowDropdown(false);
    }
    if (e.key === "ArrowDown" && showDropdown) {
      e.preventDefault();
      // Focus first dropdown item (you can enhance this with proper keyboard navigation)
    }
  };

  // Enhanced input change handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[<>]/g, "");
    setCity(sanitizedValue);
  };

  // Enhanced search handler with history
  const handleSearch = () => {
    if (!loading && city.trim().length >= 2) {
      // Add to search history
      const newHistory = [
        city.trim(),
        ...searchHistory.filter((item) => item !== city.trim()),
      ].slice(0, 5);
      setSearchHistory(newHistory);
      onSearch();
      setShowDropdown(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setShowDropdown(false);
    // Auto-search on suggestion click
    setTimeout(() => {
      const newHistory = [
        suggestion,
        ...searchHistory.filter((item) => item !== suggestion),
      ].slice(0, 5);
      setSearchHistory(newHistory);
      onSearch();
    }, 100);
  };

  // Geolocation detection
  const handleLocationDetect = async () => {
    if (!onLocationDetect) return;

    setIsDetectingLocation(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            onLocationDetect(latitude, longitude);
            setIsDetectingLocation(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setIsDetectingLocation(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    } catch (error) {
      console.error("Geolocation not supported:", error);
      setIsDetectingLocation(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setCity("");
    setShowDropdown(false);
  };

  // Clear history
  const clearHistory = () => {
    setSearchHistory([]);
    if (onClearHistory) onClearHistory();
  };

  const isSearchDisabled =
    loading || !city.trim() || city.trim().length < 2 || disabled;

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto ${className}`}
      ref={searchBarRef}
    >
      {/* Main Search Bar */}
      <div className="relative group">
        <div className="relative">
          <input
            type="text"
            value={city}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() =>
              setShowDropdown(
                city.length === 0
                  ? searchHistory.length > 0
                  : suggestions.length > 0
              )
            }
            placeholder={placeholder}
            disabled={loading || disabled}
            maxLength={50}
            autoComplete="off"
            spellCheck="false"
            className={`
              w-full px-6 py-4 pr-32 text-lg rounded-2xl border-2 
              transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-4 focus:scale-[1.02]
              group-hover:shadow-lg
              ${
                isDarkMode
                  ? `bg-gray-800/60 border-gray-600 text-white placeholder-gray-400 
                   focus:border-purple-400 focus:ring-purple-400/30 
                   backdrop-blur-md shadow-xl
                   hover:bg-gray-800/80 hover:border-gray-500`
                  : `bg-white/90 border-gray-200 text-gray-900 placeholder-gray-500 
                   focus:border-blue-400 focus:ring-blue-400/30 
                   backdrop-blur-md shadow-lg
                   hover:bg-white hover:border-gray-300`
              }
              ${loading || disabled ? "cursor-not-allowed opacity-70" : ""}
              ${
                city.trim().length > 0 && city.trim().length < 2
                  ? "border-red-300"
                  : ""
              }
            `}
          />

          {/* Action Buttons Container */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Clear Button */}
            {city && (
              <button
                onClick={clearSearch}
                type="button"
                aria-label="Clear search"
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Location Detect Button */}
            {onLocationDetect && (
              <button
                onClick={handleLocationDetect}
                disabled={isDetectingLocation}
                type="button"
                aria-label="Detect current location"
                className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  isDarkMode
                    ? "text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
                    : "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                } ${
                  isDetectingLocation ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isDetectingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearchDisabled}
              type="button"
              aria-label="Search weather"
              className={`
                px-4 py-2 rounded-xl transition-all duration-300 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isDarkMode
                    ? `bg-gradient-to-r from-purple-600 to-purple-700 
                     hover:from-purple-700 hover:to-purple-800 
                     text-white shadow-lg hover:shadow-purple-500/25
                     focus:ring-purple-400`
                    : `bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 
                     text-white shadow-lg hover:shadow-blue-500/25
                     focus:ring-blue-400`
                }
                ${!isSearchDisabled ? "hover:scale-105 active:scale-95" : ""}
              `}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Input validation indicator */}
          {city.trim().length > 0 && city.trim().length < 2 && (
            <div className="absolute right-36 top-1/2 transform -translate-y-1/2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isDarkMode ? "bg-red-400" : "bg-red-500"
                }`}
              />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown &&
          (suggestions.length > 0 || searchHistory.length > 0) && (
            <div
              ref={dropdownRef}
              className={`
              absolute top-full left-0 right-0 mt-2 rounded-2xl border backdrop-blur-md shadow-2xl z-50
              ${
                isDarkMode
                  ? "bg-gray-800/90 border-gray-600"
                  : "bg-white/90 border-gray-200"
              }
            `}
            >
              {/* Recent Searches */}
              {searchHistory.length > 0 && city.length === 0 && (
                <div className="p-4 border-b border-opacity-20">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Recent Searches
                    </h3>
                    <button
                      onClick={clearHistory}
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isDarkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors mb-1
                      ${
                        isDarkMode
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    >
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 opacity-50" />
                        {item}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4">
                  <h3
                    className={`text-sm font-medium mb-2 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Suggestions
                  </h3>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors mb-1
                      ${
                        isDarkMode
                          ? "text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                    >
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 opacity-50" />
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
      </div>

      {/* Validation message */}
      {city.length > 0 && city.trim().length < 2 && (
        <p
          className={`text-sm mt-1 px-2 ${
            isDarkMode ? "text-red-400" : "text-red-500"
          }`}
        >
          Please enter at least 2 characters
        </p>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Quick:
          </span>
          {popularCities.slice(0, 3).map((cityName, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(cityName)}
              className={`
                text-xs px-2 py-1 rounded-full transition-all duration-200 hover:scale-105
                ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                }
              `}
            >
              {cityName}
            </button>
          ))}
        </div>

        <div
          className={`text-xs ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          Press Enter to search
        </div>
      </div>
    </div>
  );
};
// Weather Card Component
const WeatherCard = ({ weather }) => {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [unit, setUnit] = useState("C");
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleUnit = () => {
    setUnit(unit === "C" ? "F" : "C");
  };

  // Slide navigation
  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % 3);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + 3) % 3);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const goToSlide = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Temperature calculations
  const temp = unit === "C" ? weather.current.temp_c : weather.current.temp_f;
  const feelsLike =
    unit === "C" ? weather.current.feelslike_c : weather.current.feelslike_f;
  const tempUnit = unit === "C" ? "°C" : "°F";

  // Get forecast data if available
  const forecast = weather.forecast?.forecastday || [];
  const todayForecast = forecast[0]?.hour || [];
  const upcomingDays = forecast.slice(1, 4);

  // Current time for hourly forecast
  const currentHour = new Date().getHours();
  const nextHours = todayForecast.slice(currentHour, currentHour + 6);

  // Slide content renderer
  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Main Temperature Display */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div
                  className={`text-7xl font-thin ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {Math.round(temp)}
                </div>
                <div className="flex flex-col items-start">
                  <button
                    onClick={toggleUnit}
                    className={`text-2xl font-light transition-all duration-200 hover:scale-110 ${
                      isDarkMode
                        ? "text-purple-400 hover:text-purple-300"
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    {tempUnit}
                  </button>
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Feels like {Math.round(feelsLike)}
                    {tempUnit}
                  </div>
                </div>
              </div>
              <p
                className={`text-xl font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {weather.current.condition.text}
              </p>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-700/30 hover:bg-gray-700/40"
                    : "bg-white/30 hover:bg-white/40"
                }`}
              >
                <Droplets
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Humidity
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {weather.current.humidity}%
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-700/30 hover:bg-gray-700/40"
                    : "bg-white/30 hover:bg-white/40"
                }`}
              >
                <Wind
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Wind
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {weather.current.wind_kph} km/h ({weather.current.wind_mph}{" "}
                    mph)
                  </p>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Direction: {weather.current.wind_dir}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-700/30 hover:bg-gray-700/40"
                    : "bg-white/30 hover:bg-white/40"
                }`}
              >
                <Gauge
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-orange-400" : "text-orange-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Pressure
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {weather.current.pressure_mb} mb
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-700/30 hover:bg-gray-700/40"
                    : "bg-white/30 hover:bg-white/40"
                }`}
              >
                <Eye
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Visibility
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {weather.current.visibility_km} km
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover:scale-105 col-span-2 ${
                  isDarkMode
                    ? "bg-gray-700/30 hover:bg-gray-700/40"
                    : "bg-white/30 hover:bg-white/40"
                }`}
              >
                <Thermometer
                  className={`h-6 w-6 ${
                    isDarkMode ? "text-pink-400" : "text-pink-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Feels Like
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(feelsLike)}
                    {tempUnit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <HourlyForecast
            nextHours={nextHours}
            unit={unit}
            isDarkMode={isDarkMode}
            tempUnit={tempUnit}
          />
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3
              className={`text-xl font-semibold text-center mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              3-Day Forecast
            </h3>
            <div className="space-y-3">
              {upcomingDays.map((day, index) => {
                const maxTemp =
                  unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f;
                const minTemp =
                  unit === "C" ? day.day.mintemp_c : day.day.mintemp_f;
                const dayName = new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "short",
                });

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:scale-102 ${
                      isDarkMode
                        ? "bg-gray-700/30 hover:bg-gray-700/40"
                        : "bg-white/30 hover:bg-white/40"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <p
                        className={`text-lg font-medium w-8 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {dayName}
                      </p>
                      <img
                        src={day.day.condition.icon}
                        alt={day.day.condition.text}
                        className="w-8 h-8"
                      />
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {day.day.condition.text}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p
                        className={`text-lg font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {Math.round(maxTemp)}
                        {tempUnit}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {Math.round(minTemp)}
                        {tempUnit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-3xl p-8 backdrop-blur-lg border transition-all duration-300 relative overflow-hidden ${
        isDarkMode
          ? "bg-gray-800/30 border-gray-600/50"
          : "bg-white/40 border-white/50"
      }`}
    >
      {/* Header with Location and Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevSlide}
          className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
            isDarkMode
              ? "hover:bg-gray-700/50 text-gray-400 hover:text-white"
              : "hover:bg-white/50 text-gray-600 hover:text-gray-900"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="text-center flex-1">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <MapPin
              className={`h-5 w-5 ${
                isDarkMode ? "text-purple-400" : "text-blue-600"
              }`}
            />
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {weather.location.name}
            </h2>
          </div>
          <p
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {weather.location.region}, {weather.location.country}
          </p>
        </div>

        <button
          onClick={nextSlide}
          className={`p-2 rounded-full transition-all duration-200 hover:scale-110 ${
            isDarkMode
              ? "hover:bg-gray-700/50 text-gray-400 hover:text-white"
              : "hover:bg-white/50 text-gray-600 hover:text-gray-900"
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Slide Content */}
      <div
        className={`transition-all duration-300 ${
          isAnimating
            ? "opacity-0 transform scale-95"
            : "opacity-100 transform scale-100"
        }`}
      >
        {renderSlideContent()}
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-2 mt-6">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              currentSlide === index
                ? isDarkMode
                  ? "bg-purple-400"
                  : "bg-blue-600"
                : isDarkMode
                ? "bg-gray-600"
                : "bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Sun Times - Always visible at bottom */}
      {weather.astronomy && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-opacity-20 border-gray-400">
          <div className="flex items-center space-x-2">
            <Sunrise
              className={`h-4 w-4 ${
                isDarkMode ? "text-yellow-400" : "text-orange-500"
              }`}
            />
            <div>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sunrise
              </p>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {weather.astronomy.astro.sunrise}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Sunset
              className={`h-4 w-4 ${
                isDarkMode ? "text-orange-400" : "text-red-500"
              }`}
            />
            <div>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Sunset
              </p>
              <p
                className={`text-sm font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {weather.astronomy.astro.sunset}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// HourlyForecast component for cleaner code and reusability
const HourlyForecast = ({ nextHours, unit, isDarkMode, tempUnit }) => {
  if (!nextHours || nextHours.length === 0) {
    return (
      <div className="text-center text-sm py-8 text-gray-400">
        No hourly forecast data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3
        className={`text-xl font-semibold text-center mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Hourly Forecast
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {nextHours.map((hour, index) => {
          const hourTime = new Date(hour.time).getHours();
          const temp = unit === "C" ? hour.temp_c : hour.temp_f;
          const feelsLike = unit === "C" ? hour.feelslike_c : hour.feelslike_f;
          return (
            <div
              key={index}
              className={`p-3 rounded-xl text-center transition-all duration-200 hover:scale-105 ${
                isDarkMode
                  ? "bg-gray-700/30 hover:bg-gray-700/40"
                  : "bg-white/30 hover:bg-white/40"
              }`}
            >
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {hourTime === new Date().getHours() ? "Now" : `${hourTime}:00`}
              </p>
              <div className="my-2">
                <img
                  src={hour.condition.icon}
                  alt={hour.condition.text}
                  className="w-8 h-8 mx-auto"
                />
              </div>
              <p
                className={`text-lg font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {Math.round(temp)}
                {tempUnit}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                Rain: {hour.chance_of_rain}%
              </p>
              {/* More details */}
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Wind: {hour.wind_kph} km/h
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Humidity: {hour.humidity}%
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Feels like: {Math.round(feelsLike)}
                {tempUnit}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                UV: {hour.uv}
              </p>
              <p
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Pressure: {hour.pressure_mb} mb
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Favorite Cities Bar component
const FavoriteCitiesBar = ({ favorites, onSelect, onRemove, isDarkMode }) => (
  <div className="flex flex-wrap gap-2 mb-4 items-center justify-center">
    {favorites.length > 0 && (
      <span
        className={`text-xs font-semibold ${
          isDarkMode ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Favorites:
      </span>
    )}
    {favorites.map((city) => (
      <span
        key={city}
        className={`flex items-center bg-white/20 rounded-full px-3 py-1 text-sm font-medium ${
          isDarkMode ? "text-white" : "text-gray-800"
        }`}
      >
        <button
          onClick={() => onSelect(city)}
          className={`mr-1 font-semibold hover:underline ${
            isDarkMode ? "text-purple-300" : "text-blue-700"
          }`}
        >
          {city}
        </button>
        <button
          onClick={() => onRemove(city)}
          className={`ml-1 text-xs hover:text-red-500 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
          title="Remove from favorites"
        >
          ×
        </button>
      </span>
    ))}
  </div>
);

// Main App Component
const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("weather-favorites") || "[]");
    }
    return [];
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("weather-theme") || "default";
    }
    return "default";
  });
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    localStorage.setItem("weather-theme", theme);
  }, [theme]);

  // Force re-render on theme change
  useEffect(() => {}, [theme]);

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem("weather-favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Add these useEffects to your existing component
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && showMap) {
        setShowMap(false);
        setIsMapFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showMap]);

  useEffect(() => {
    if (showMap) {
      document.body.style.overflow = "hidden";
      setIsMapLoading(true);
      // Simulate iframe loading time
      const timer = setTimeout(() => setIsMapLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "unset";
      setIsMapLoading(false);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showMap]);

  // Add these helper functions to your component
  const handleMapOpen = () => {
    setShowMap(true);
  };

  const handleMapClose = () => {
    setShowMap(false);
    setIsMapFullscreen(false);
  };

  const toggleMapFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleMapClose();
    }
  };

  // Add/remove favorite
  const toggleFavorite = (cityName) => {
    setFavorites((prev) =>
      prev.includes(cityName)
        ? prev.filter((c) => c !== cityName)
        : [cityName, ...prev.filter((c) => c !== cityName)].slice(0, 8)
    );
  };

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchWeather(city);
      setWeather(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  // Determine if it's night time
  const isNight = weather
    ? isNightTime(
        weather.astronomy.astro.sunrise,
        weather.astronomy.astro.sunset
      )
    : false;

  // Enhanced background logic with theme
  const getCustomBackground = (
    weatherCondition,
    isDarkMode,
    isNight,
    theme
  ) => {
    if (theme === "ocean") {
      return isDarkMode
        ? "bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900"
        : "bg-gradient-to-br from-cyan-200 via-blue-300 to-indigo-200";
    }
    if (theme === "sunset") {
      return isDarkMode
        ? "bg-gradient-to-br from-fuchsia-900 via-pink-900 to-yellow-900"
        : "bg-gradient-to-br from-yellow-200 via-pink-300 to-fuchsia-300";
    }
    if (theme === "forest") {
      return isDarkMode
        ? "bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900"
        : "bg-gradient-to-br from-green-200 via-emerald-300 to-lime-200";
    }
    if (theme === "rose") {
      return isDarkMode
        ? "bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-900"
        : "bg-gradient-to-br from-rose-200 via-pink-200 to-fuchsia-200";
    }
    // Default: weather-based
    return getWeatherBackground(weatherCondition, isDarkMode, isNight);
  };

  // Replace backgroundClasses assignment:
  const backgroundClasses = `min-h-screen relative overflow-hidden transition-all duration-1000 ease-in-out ${
    weather
      ? getCustomBackground(
          weather.current.condition.text,
          isDarkMode,
          isNight,
          theme
        )
      : isDarkMode
      ? "bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950"
      : "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600"
  }`;

  // Get weather-based animation colors
  const animationColors = weather
    ? getWeatherAnimations(weather.current.condition.text, isDarkMode)
    : {
        primary: isDarkMode ? "bg-purple-500" : "bg-white",
        secondary: isDarkMode ? "bg-indigo-500" : "bg-blue-200",
        accent: isDarkMode ? "bg-blue-500" : "bg-indigo-200",
      };

  return (
    <div className={backgroundClasses}>
      {/* Enhanced animated background with weather-based colors */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse opacity-20 transition-colors duration-1000 ${animationColors.primary}`}
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        ></div>
        <div
          className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20 transition-colors duration-1000 ${animationColors.secondary}`}
          style={{ animationDelay: "2s", animationDuration: "6s" }}
        ></div>
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse opacity-10 transition-colors duration-1000 ${animationColors.accent}`}
          style={{ animationDelay: "4s", animationDuration: "8s" }}
        ></div>

        {/* Additional weather-specific animations */}
        {weather &&
          weather.current.condition.text.toLowerCase().includes("rain") && (
            <>
              <div
                className="absolute top-0 left-1/4 w-1 h-20 bg-blue-400/30 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-0 left-1/2 w-1 h-16 bg-blue-300/30 animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute top-0 right-1/4 w-1 h-24 bg-blue-500/30 animate-pulse"
                style={{ animationDelay: "3s" }}
              ></div>
            </>
          )}

        {weather &&
          weather.current.condition.text.toLowerCase().includes("snow") && (
            <>
              <div
                className="absolute top-20 left-1/4 w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute top-32 right-1/3 w-3 h-3 bg-white/40 rounded-full animate-bounce"
                style={{ animationDelay: "1.5s" }}
              ></div>
              <div
                className="absolute top-16 right-1/4 w-2 h-2 bg-white/70 rounded-full animate-bounce"
                style={{ animationDelay: "2.5s" }}
              ></div>
            </>
          )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
            isDarkMode
              ? "bg-gray-800/80 text-yellow-400 hover:bg-gray-700/80 backdrop-blur-sm"
              : "bg-white/80 text-blue-600 hover:bg-white/90 backdrop-blur-sm"
          }`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6" />
          ) : (
            <Moon className="h-6 w-6" />
          )}
        </button>

        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-center">
          <h1
            className={`text-6xl md:text-7xl font-extrabold mb-4 tracking-tight transition-all duration-700 ${
              isDarkMode
                ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"
                : "text-white drop-shadow-lg"
            }`}
          >
            WeatherScope
          </h1>
          <p className="text-xl md:text-2xl font-light text-white/90 max-w-2xl">
            Discover weather insights with elegant simplicity and precision
          </p>
          {weather && (
            <p className="text-sm text-white/70 mt-2 px-4 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              Currently: {weather.current.condition.text} in{" "}
              {weather.location.name}
            </p>
          )}
        </div>
        {/* Theme Selector - always visible above search bar */}
        <div className="w-full max-w-md mb-4">
          <ThemeSelector
            selected={theme}
            onChange={setTheme}
            isDarkMode={isDarkMode}
          />
        </div>
        {/* Favorite Cities Bar */}
        <FavoriteCitiesBar
          favorites={favorites}
          onSelect={(cityName) => {
            setCity(cityName);
            setError("");
            setWeather(null);
            setTimeout(() => handleSearch(), 100);
          }}
          onRemove={toggleFavorite}
          isDarkMode={isDarkMode}
        />
        {/* Search section */}
        <div className="w-full max-w-md mb-10">
          <SearchBar
            city={city}
            setCity={setCity}
            onSearch={handleSearch}
            loading={loading}
          />
          {/* Add/Remove Favorite Button */}
          {city && city.trim().length > 0 && (
            <button
              onClick={() => toggleFavorite(city.trim())}
              className={`mt-2 px-4 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                favorites.includes(city.trim())
                  ? isDarkMode
                    ? "bg-purple-900/30 border-purple-400 text-purple-300 hover:bg-purple-900/50"
                    : "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200"
                  : isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
              style={{ minWidth: 120 }}
            >
              {favorites.includes(city.trim())
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center space-y-4 text-white/80">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-white/60" />
            </div>
            <p className="font-light text-lg">Fetching weather data...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            className={`border backdrop-blur-sm border-red-400/50 rounded-2xl p-6 max-w-md w-full ${
              isDarkMode ? "bg-red-900/20" : "bg-red-100/20"
            }`}
          >
            <div className="flex items-center space-x-3 justify-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <p className="font-medium text-lg text-white">{error}</p>
            </div>
          </div>
        )}

        {/* Weather card */}
        {weather && !loading && (
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WeatherCard weather={weather} />
          </div>
        )}
        <button
          onClick={handleMapOpen}
          className={`fixed bottom-8 right-8 z-30 p-4 rounded-full shadow-lg transition-all duration-300 
    hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 text-xl group
    ${
      isDarkMode
        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white focus:ring-purple-400/50 shadow-purple-500/25"
        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white focus:ring-blue-400/50 shadow-blue-500/25"
    }
  `}
          aria-label="Show India Weather Map"
        >
          <MapPin className="h-6 w-6 transition-transform duration-200 group-hover:rotate-12" />
        </button>

        {/* Improved Weather Map Modal */}
        {showMap && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleBackdropClick}
          >
            <div
              className={`rounded-2xl shadow-2xl relative transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-4
        ${
          isMapFullscreen
            ? "w-full h-full max-w-none max-h-none m-0 rounded-none"
            : "p-4 max-w-4xl w-[90vw] max-h-[85vh] m-4"
        }
        ${
          isDarkMode
            ? "bg-gray-900 border border-gray-700"
            : "bg-white border border-gray-200"
        }
      `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with controls */}
              <div
                className={`flex items-center justify-between ${
                  isMapFullscreen ? "p-4" : "mb-4"
                }`}
              >
                <h2
                  className={`text-xl font-bold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  🌦️ Weather Map
                </h2>

                <div className="flex items-center space-x-2">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleMapFullscreen}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105
              ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
                    aria-label={
                      isMapFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                    }
                  >
                    {isMapFullscreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={handleMapClose}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-105
              ${
                isDarkMode
                  ? "bg-red-800 hover:bg-red-700 text-red-200"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
                    aria-label="Close Map"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Map Container */}
              <div
                className={`relative rounded-xl overflow-hidden ${
                  isMapFullscreen
                    ? "h-[calc(100vh-80px)]"
                    : "h-[60vh] min-h-[400px]"
                }`}
              >
                {/* Loading Overlay */}
                {isMapLoading && (
                  <div
                    className={`absolute inset-0 z-10 flex items-center justify-center rounded-xl
            ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}
          `}
                  >
                    <div className="text-center">
                      <div
                        className={`inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-current border-r-transparent mb-4
                ${isDarkMode ? "text-purple-400" : "text-blue-500"}
              `}
                      ></div>
                      <p
                        className={`text-lg font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Loading Weather Map...
                      </p>
                    </div>
                  </div>
                )}

                {/* Weather Map Iframe */}
                <iframe
                  title="India Weather Map"
                  src="https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=22.3511&lon=78.6677&zoom=4"
                  width="100%"
                  height="100%"
                  className={`w-full h-full border-0 rounded-xl transition-opacity duration-500 ${
                    isMapLoading ? "opacity-0" : "opacity-100"
                  }`}
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => setIsMapLoading(false)}
                />
              </div>

              {/* Footer with info */}
              {!isMapFullscreen && (
                <div
                  className={`mt-4 text-center text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <p>
                    Real-time weather data from OpenWeatherMap •
                    <span className="ml-1">
                      Press{" "}
                      <kbd
                        className={`px-1 py-0.5 rounded text-xs font-mono ${
                          isDarkMode
                            ? "bg-gray-700 text-gray-300"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Esc
                      </kbd>{" "}
                      to close
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder footer when no weather data */}
        {!loading && !weather && !error && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <p className="text-white/60 text-sm font-light">
              Enter a city name to get started
            </p>
            <span className="text-white/60 text-sm font-light">
              © 2025 Mohammed Shaaz — WeatherScope by Mohammed Shaaz. Built with
              Next.js & OpenWeatherMap API.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <ThemeProvider>
      <WeatherApp />
    </ThemeProvider>
  );
}
