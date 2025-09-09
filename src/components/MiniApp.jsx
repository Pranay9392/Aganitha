import React, { useState, useEffect, useRef } from 'react';

// Main App component
const MiniApp = () => {
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
  const [selectedBook, setSelectedBook] = useState(null);
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
      setBooks(data.docs.filter(book => book.cover_i).slice(0, 10)); // Filter for books with covers and limit to first 10
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookDetails = async (book) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://openlibrary.org/works/${book.key.split('/')[2]}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch book details.');
      }
      const details = await response.json();
      setSelectedBook({ ...book, details });
    } catch (err) {
      setError(err.message);
      setSelectedBook(book); // Show what we have even if details fail
    } finally {
      setLoading(false);
    }
  };

  if (selectedBook) {
    return (
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-800 rounded-lg shadow-xl">
        <button
          onClick={() => setSelectedBook(null)}
          className="self-start mb-4 p-2 bg-gray-700 rounded-full text-white text-sm hover:bg-gray-600 transition duration-300"
        >
          &larr; Back to Search
        </button>
        <img
          src={selectedBook.cover_i ? `https://covers.openlibrary.org/b/id/${selectedBook.cover_i}-M.jpg` : 'https://placehold.co/200x300?text=No+Cover'}
          alt={selectedBook.title}
          className="rounded-lg shadow-md w-full md:w-64 h-auto object-cover flex-shrink-0"
        />
        <div className="flex flex-col space-y-4">
          <h3 className="text-3xl md:text-4xl font-extrabold text-blue-400">
            {selectedBook.title}
          </h3>
          <p className="text-lg text-gray-300">
            by {selectedBook.author_name ? selectedBook.author_name.join(', ') : 'Unknown'}
          </p>
          {loading ? (
            <p className="text-blue-400">Loading details...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <>
              <p className="text-gray-400 italic">
                {selectedBook.details?.description?.value || selectedBook.details?.description || "No description available."}
              </p>
              {selectedBook.first_publish_year && (
                <p className="text-sm text-gray-500">
                  First Published: {selectedBook.first_publish_year}
                </p>
              )}
              {selectedBook.subject && (
                <p className="text-sm text-gray-500">
                  Subjects: {selectedBook.subject.slice(0, 5).join(', ')}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

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
              <div
                key={index}
                onClick={() => fetchBookDetails(book)}
                className="p-4 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center text-center cursor-pointer hover:bg-gray-700 transition duration-300"
              >
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
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`);
      if (!geoResponse.ok) throw new Error('Failed to find city.');
      const geoData = await geoResponse.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found. Please try again.');
      }
      const { latitude, longitude } = geoData.results[0];

      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&forecast_days=1&hourly=temperature_2m,precipitation_probability,wind_speed_10m`);
      if (!weatherResponse.ok) throw new Error('Failed to fetch weather data.');
      const data = await weatherResponse.json();
      if (!data.current_weather) {
        throw new Error('No weather data available.');
      }
      setWeatherData({ ...data.current_weather, city: geoData.results[0].name });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weathercode) => {
    if (weathercode >= 0 && weathercode <= 3) return { icon: '☀️', description: 'Clear sky' };
    if (weathercode >= 45 && weathercode <= 48) return { icon: '🌫️', description: 'Fog' };
    if (weathercode >= 51 && weathercode <= 67) return { icon: '🌧️', description: 'Rainy' };
    if (weathercode >= 71 && weathercode <= 77) return { icon: '🌨️', description: 'Snowy' };
    if (weathercode >= 80 && weathercode <= 82) return { icon: '⛈️', description: 'Thunderstorm' };
    if (weathercode >= 95 && weathercode <= 99) return { icon: '⚡️', description: 'Thunderstorm' };
    return { icon: '🌡️', description: 'Unknown' };
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
        <div className="max-w-lg mx-auto p-8 bg-gray-800 rounded-xl shadow-xl text-center space-y-6 animate-fadeIn">
          <h3 className="text-4xl font-bold text-gray-100">{weatherData.city}</h3>
          <div className="flex items-center justify-center gap-4">
            <p className="text-8xl">{getWeatherIcon(weatherData.weathercode).icon}</p>
            <div>
              <p className="text-6xl font-extrabold text-blue-400">{weatherData.temperature}°C</p>
              <p className="text-lg text-gray-400">{getWeatherIcon(weatherData.weathercode).description}</p>
            </div>
          </div>
          <div className="flex justify-around text-center">
            <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
              <p className="text-gray-400">Wind</p>
              <p className="text-xl font-semibold text-gray-200">{weatherData.windspeed} km/h</p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg shadow-inner">
              <p className="text-gray-400">Direction</p>
              <p className="text-xl font-semibold text-gray-200">{weatherData.winddirection}°</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. Recipe Ideas Component ---
const RecipeIdeas = () => {
  const [ingredient, setIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
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

  const fetchRecipeDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe details.');
      }
      const data = await response.json();
      if (!data.meals || data.meals.length === 0) {
        throw new Error('Recipe details not found.');
      }
      setSelectedRecipe(data.meals[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeDetails = () => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = selectedRecipe[`strIngredient${i}`];
      const measure = selectedRecipe[`strMeasure${i}`];
      if (ingredient) {
        ingredients.push(`${measure} ${ingredient}`);
      }
    }

    return (
      <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-800 rounded-lg shadow-xl">
        <button
          onClick={() => setSelectedRecipe(null)}
          className="self-start mb-4 p-2 bg-gray-700 rounded-full text-white text-sm hover:bg-gray-600 transition duration-300"
        >
          &larr; Back to Recipes
        </button>
        <img
          src={selectedRecipe.strMealThumb}
          alt={selectedRecipe.strMeal}
          className="rounded-lg shadow-md w-full md:w-80 h-auto object-cover flex-shrink-0"
        />
        <div className="flex flex-col space-y-4">
          <h3 className="text-3xl md:text-4xl font-extrabold text-blue-400">
            {selectedRecipe.strMeal}
          </h3>
          <p className="text-lg text-gray-300">
            Category: {selectedRecipe.strCategory} | Cuisine: {selectedRecipe.strArea}
          </p>
          <div>
            <h4 className="text-2xl font-bold text-gray-200 mb-2">Ingredients</h4>
            <ul className="list-disc list-inside text-gray-400">
              {ingredients.map((ing, index) => (
                <li key={index}>{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-200 mb-2">Instructions</h4>
            <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{selectedRecipe.strInstructions}</p>
          </div>
          {selectedRecipe.strYoutube && (
            <a
              href={selectedRecipe.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 p-3 bg-red-600 text-white font-semibold rounded-full text-center hover:bg-red-700 transition duration-300"
            >
              Watch on YouTube
            </a>
          )}
        </div>
      </div>
    );
  };

  if (selectedRecipe) {
    return renderRecipeDetails();
  }

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
              <div
                key={recipe.idMeal}
                onClick={() => fetchRecipeDetails(recipe.idMeal)}
                className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition duration-300"
              >
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
  const canvasRef = useRef(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [selectedQuake, setSelectedQuake] = useState(null);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || earthquakes.length === 0) return;

    const ctx = canvas.getContext('2d');

    // This function now draws the entire map and earthquakes on the canvas.
    const drawMap = (ctx, canvas) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a simple world map outline or background
      const mapImage = new Image();
      mapImage.src = "/worldmap.png";
      mapImage.onload = () => {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        
        // This nested function draws the earthquake markers on top of the map.
        const drawEarthquakes = (ctx, canvas) => {
          earthquakes.forEach(quake => {
            const [longitude, latitude] = quake.geometry.coordinates;
            const magnitude = quake.properties.mag;

            // Mercator projection to canvas coordinates
            const x = (longitude + 180) / 360 * canvas.width;
            const y = (90 - latitude) / 180 * canvas.height;

            const radius = Math.max(2, magnitude * 2);
            let color;
            if (magnitude >= 6.0) color = 'rgba(255, 0, 0, 0.8)'; // Red
            else if (magnitude >= 5.0) color = 'rgba(255, 69, 0, 0.8)'; // Red-Orange
            else if (magnitude >= 4.0) color = 'rgba(255, 140, 0, 0.8)'; // Dark Orange
            else if (magnitude >= 3.0) color = 'rgba(255, 215, 0, 0.8)'; // Gold
            else if (magnitude >= 2.0) color = 'rgba(255, 255, 0, 0.8)'; // Yellow
            else color = 'rgba(0, 255, 0, 0.8)'; // Green

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          });
        };
        drawEarthquakes(ctx, canvas);
      };
    };

    // This function is now defined after drawMap, fixing the ReferenceError.
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetWidth * (1080 / 1920); // Maintain aspect ratio
      drawMap(ctx, canvas);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (event.clientX - rect.left) * scaleX;
      const clickY = (event.clientY - rect.top) * scaleY;

      // Find the closest earthquake to the click
      let closestQuake = null;
      let minDistance = Infinity;

      earthquakes.forEach(quake => {
        const [longitude, latitude] = quake.geometry.coordinates;
        const x = (longitude + 180) / 360 * canvas.width;
        const y = (90 - latitude) / 180 * canvas.height;
        const distance = Math.sqrt(Math.pow(x - clickX, 2) + Math.pow(y - clickY, 2));

        if (distance < minDistance) {
          minDistance = distance;
          closestQuake = quake;
        }
      });

      if (closestQuake && minDistance < 20) { // A threshold for a valid click
        setSelectedQuake(closestQuake);
      } else {
        setSelectedQuake(null);
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [earthquakes]);

  const getQuakeColor = (magnitude) => {
    if (magnitude >= 6.0) return 'bg-red-500';
    if (magnitude >= 5.0) return 'bg-orange-500';
    if (magnitude >= 4.0) return 'bg-yellow-400';
    if (magnitude >= 3.0) return 'bg-green-400';
    return 'bg-blue-400';
  };

  return (
    <div className="space-y-6">
      {loading && <p className="text-center text-blue-400">Loading earthquake data...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="relative w-full aspect-video border border-gray-700 rounded-xl overflow-hidden shadow-lg bg-gray-800">
            <canvas ref={canvasRef} className="w-full h-full block"></canvas>
            <div className="absolute top-4 right-4 p-3 bg-gray-800 rounded-lg shadow-lg">
              <h4 className="text-sm font-bold text-gray-200 mb-2">Magnitude Legend</h4>
              <div className="flex flex-col gap-1 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500"></span>
                  <span>6.0+</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                  <span>5.0 - 5.9</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
                  <span>4.0 - 4.9</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-400"></span>
                  <span>3.0 - 3.9</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-400"></span>
                  <span>&lt; 3.0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
              <h4 className="text-2xl font-bold text-gray-200 mb-4">Latest Earthquakes</h4>
              {selectedQuake ? (
                <div className="space-y-4">
                  <h5 className="text-xl font-semibold text-blue-400">Selected Earthquake</h5>
                  <p className="text-gray-300">
                    <span className="font-bold">Magnitude:</span> {selectedQuake.properties.mag}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-bold">Location:</span> {selectedQuake.properties.place}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-bold">Time:</span> {new Date(selectedQuake.properties.time).toLocaleString()}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-bold">Coordinates:</span> [{selectedQuake.geometry.coordinates[1].toFixed(2)}, {selectedQuake.geometry.coordinates[0].toFixed(2)}]
                  </p>
                  <a
                    href={selectedQuake.properties.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-400 hover:underline transition duration-300"
                  >
                    More Info &rarr;
                  </a>
                </div>
              ) : (
                <p className="text-gray-500">
                  Click on an earthquake marker to view details.
                </p>
              )}
            </div>

            <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
              <h4 className="text-2xl font-bold text-gray-200 mb-4">Clickable List</h4>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {earthquakes.length > 0 ? (
                  earthquakes.map((quake, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedQuake(quake)}
                      className={`p-4 rounded-lg shadow-inner cursor-pointer hover:bg-gray-700 transition duration-300
                      ${selectedQuake?.id === quake.id ? 'bg-blue-600' : 'bg-gray-700'}`}
                    >
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${getQuakeColor(quake.properties.mag)}`}></span>
                      <p className="inline-block text-lg font-semibold text-gray-200">{quake.properties.mag.toFixed(1)} - {quake.properties.place}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No recent earthquakes found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniApp;