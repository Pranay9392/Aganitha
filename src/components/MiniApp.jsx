import React, { useState, useEffect } from 'react';

// Main App component
const MainApp = () => {
  const [currentPage, setCurrentPage] = useState('bookfinder');

  const renderPage = () => {
    switch (currentPage) {
      case 'bookfinder':
        return <BookFinder />;
      case 'weather':
        return <WeatherNow />;
      case 'recipe':
        return <RecipeIdeas />;
      case 'earthquake':
        return <EarthquakeVisualizer />;
      default:
        return <BookFinder />;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <header className="py-6 px-4 md:px-8 shadow-lg bg-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-4 md:mb-0">
            Mini-App Dashboard
          </h1>
          <nav className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
            <NavItem
              title="Book Finder"
              onClick={() => setCurrentPage('bookfinder')}
              isActive={currentPage === 'bookfinder'}
            />
            <NavItem
              title="Weather Now"
              onClick={() => setCurrentPage('weather')}
              isActive={currentPage === 'weather'}
            />
            <NavItem
              title="Recipe Ideas"
              onClick={() => setCurrentPage('recipe')}
              isActive={currentPage === 'recipe'}
            />
            <NavItem
              title="Earthquake Visualizer"
              onClick={() => setCurrentPage('earthquake')}
              isActive={currentPage === 'earthquake'}
            />
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-200 mb-6 border-b border-gray-700 pb-2">
          {currentPage
            .charAt(0)
            .toUpperCase() + currentPage.slice(1).replace(/([A-Z])/g, ' $1')}
        </h2>
        {renderPage()}
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-700 mt-8">
        <p>Developed by Aletti Pranany</p>
        <p>Btech final year cse student at SR UNIVERSITY Warangal</p>
      </footer>
    </div>
  );
};

const NavItem = ({ title, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`
      py-2 px-4 rounded-full transition-all duration-300
      ${isActive
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-blue-500 hover:text-white'
      }
    `}
  >
    {title}
  </button>
);

// --- 1. Book Finder Component ---
const BookFinder = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) {
      setBooks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book data.');
      }
      const data = await response.json();
      setBooks(data.docs.slice(0, 10)); // Limit to first 10 results
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a book title..."
            className="flex-grow p-3 rounded-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 rounded-full text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <p className="text-center text-blue-400">Searching...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.length > 0 ? (
            books.map((book, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center text-center">
                <img
                  src={book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'https://placehold.co/150x200?text=No+Cover'}
                  alt={book.title}
                  className="rounded-lg shadow-md mb-4 h-48 w-32 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-100">{book.title}</h3>
                <p className="text-sm text-gray-400">
                  by {book.author_name ? book.author_name.join(', ') : 'Unknown'}
                </p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Enter a book title to begin your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// --- 2. Weather Now Component ---
const WeatherNow = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city) {
      setWeatherData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Step 1: Geocoding to get coordinates
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
      if (!geoResponse.ok) throw new Error('Failed to find city.');
      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try again.');
      }
      const { latitude, longitude } = geoData.results[0];

      // Step 2: Fetch weather using coordinates
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather data.');
      const weatherData = await weatherResponse.json();
      if (!weatherData.current_weather) {
        throw new Error('No weather data available.');
      }
      setWeatherData({ ...weatherData.current_weather, city: geoData.results[0].name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weathercode) => {
    // A simplified mapping of weather codes to icons
    if (weathercode >= 0 && weathercode <= 3) return '☀️'; // Clear sky, cloudy
    if (weathercode >= 45 && weathercode <= 48) return '🌫️'; // Fog
    if (weathercode >= 51 && weathercode <= 67) return '🌧️'; // Drizzle, rain
    if (weathercode >= 71 && weathercode <= 77) return '🌨️'; // Snow
    if (weathercode >= 80 && weathercode <= 82) return '⛈️'; // Thunderstorm
    if (weathercode >= 95 && weathercode <= 99) return '⚡️'; // Thunderstorm
    return '🌡️'; // Default
  };

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter a city..."
            className="flex-grow p-3 rounded-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 rounded-full text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300"
          >
            Get Weather
          </button>
        </form>
      </div>

      {loading && <p className="text-center text-blue-400">Checking the weather...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {weatherData && (
        <div className="max-w-lg mx-auto p-8 bg-gray-800 rounded-xl shadow-xl text-center space-y-4 animate-fadeIn">
          <h3 className="text-4xl font-bold text-gray-100">{weatherData.city}</h3>
          <p className="text-7xl">{getWeatherIcon(weatherData.weathercode)}</p>
          <p className="text-5xl font-extrabold text-blue-400">{weatherData.temperature}°C</p>
          <p className="text-lg text-gray-300">Wind Speed: {weatherData.windspeed} km/h</p>
        </div>
      )}
    </div>
  );
};

// --- 3. Recipe Ideas Component ---
const RecipeIdeas = () => {
  const [ingredient, setIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ingredient) {
      setRecipes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes.');
      }
      const data = await response.json();
      if (!data.meals) {
        setRecipes([]);
        throw new Error('No recipes found for that ingredient.');
      }
      setRecipes(data.meals);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="Search for a recipe by ingredient..."
            className="flex-grow p-3 rounded-full bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 rounded-full text-white font-semibold shadow-md hover:bg-blue-700 transition duration-300"
          >
            Find Recipes
          </button>
        </form>
      </div>

      {loading && <p className="text-center text-blue-400">Finding delicious ideas...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <div key={recipe.idMeal} className="p-4 bg-gray-800 rounded-lg shadow-lg">
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="rounded-lg shadow-md mb-4 w-full h-40 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-100 text-center">{recipe.strMeal}</h3>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Enter an ingredient to get recipe ideas.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// --- 4. Earthquake Visualizer Component ---
const EarthquakeVisualizer = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
        if (!response.ok) {
          throw new Error('Failed to fetch earthquake data.');
        }
        const data = await response.json();
        setEarthquakes(data.features);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEarthquakes();
  }, []);

  const getMarkerSize = (magnitude) => {
    return Math.max(5, magnitude * 4); // Scale marker size based on magnitude
  };

  const getMarkerColor = (magnitude) => {
    if (magnitude >= 5.0) return 'bg-red-500';
    if (magnitude >= 4.0) return 'bg-orange-500';
    if (magnitude >= 3.0) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div className="space-y-6">
      {loading && <p className="text-center text-blue-400">Loading earthquake data...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="relative w-full aspect-video border border-gray-700 rounded-xl overflow-hidden shadow-lg bg-gray-800">
          <img
            src="https://placehold.co/1200x675/000000/ffffff?text=World+Map"
            alt="World Map"
            className="w-full h-full object-cover opacity-50"
          />
          {earthquakes.map((quake, index) => {
            const [longitude, latitude] = quake.geometry.coordinates;
            const magnitude = quake.properties.mag;
            const place = quake.properties.place;

            // Simple Mercator projection for placing markers on the image.
            const x = (longitude + 180) / 360 * 100;
            const y = (90 - latitude) / 180 * 100;

            return (
              <div
                key={index}
                className={`absolute rounded-full ${getMarkerColor(magnitude)} animate-pulse`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${getMarkerSize(magnitude)}px`,
                  height: `${getMarkerSize(magnitude)}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`Magnitude: ${magnitude}\nLocation: ${place}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MainApp;
