import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';

ChartJS.register();

const App = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = 'YOUR_API_KEY';  // Replace with your OpenWeatherMap API Key

  // Fetch the current weather and forecast data
  const fetchWeatherData = async () => {
    if (!city) return;
    setLoading(true);
    setError('');
    
    try {
      // Fetch current weather
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      
      // Fetch forecast data (next 7 days)
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${currentWeatherResponse.data.coord.lat}&lon=${currentWeatherResponse.data.coord.lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${apiKey}`
      );

      setWeatherData(currentWeatherResponse.data);
      setForecastData(forecastResponse.data.daily);
    } catch (err) {
      setError('City not found or API error');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  // Generate chart data
  const generateChartData = () => {
    const dates = forecastData.map(day => new Date(day.dt * 1000).toLocaleDateString());
    const temps = forecastData.map(day => day.temp.day);
    const humidity = forecastData.map(day => day.humidity);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temps,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
        },
        {
          label: 'Humidity (%)',
          data: humidity,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: false,
        },
      ],
    };
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={handleInputChange}
        placeholder="Enter city name"
      />
      <button onClick={fetchWeatherData}>Get Weather</button>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {weatherData && (
        <div className="weather-info">
          <h2>{weatherData.name}</h2>
          <p>{new Date(weatherData.dt * 1000).toLocaleString()}</p>
          <p>Condition: {weatherData.weather[0].description}</p>
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Humidity: {weatherData.main.humidity}%</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
        </div>
      )}

      {forecastData && (
        <div className="chart-container">
          <h3>7-day Forecast</h3>
          <Line data={generateChartData()} />
        </div>
      )}
    </div>
  );
};

export default App;
