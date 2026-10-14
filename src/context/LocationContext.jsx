import React, { createContext, useContext, useEffect, useState } from 'react';
import { showtimeService } from '../services/showtimeService';

const LocationContext = createContext(null);
const CITY_KEY = 'cinewave_city';

export const LocationProvider = ({ children }) => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCityState] = useState(() => localStorage.getItem(CITY_KEY) || '');
  const [loadingCities, setLoadingCities] = useState(true);
  const [cityError, setCityError] = useState('');

  const refreshCities = async () => {
    try {
      setLoadingCities(true);
      setCityError('');
      const theaters = await showtimeService.getTheaters();
      const cityList = [...new Set(theaters.map(theater => theater.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));
      setCities(cityList);
      setSelectedCityState(current => {
        if (!current && cityList.length) {
          localStorage.setItem(CITY_KEY, cityList[0]);
          return cityList[0];
        }
        if (current && !cityList.includes(current)) {
          localStorage.removeItem(CITY_KEY);
          return '';
        }
        return current;
      });
    } catch (error) {
      setCityError(error.message || 'Cinema locations are unavailable.');
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    refreshCities();
  }, []);

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    if (city) localStorage.setItem(CITY_KEY, city);
    else localStorage.removeItem(CITY_KEY);
  };

  return (
    <LocationContext.Provider value={{ cities, selectedCity, setSelectedCity, loadingCities, cityError, refreshCities }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};