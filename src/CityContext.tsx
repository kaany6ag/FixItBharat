import React, { createContext, useContext, useState, useEffect } from 'react';
import { MASTER_CITIES, City, getCityWards } from './cities';

interface CityContextType {
  selectedCity: City;
  setSelectedCity: (city: City) => void;
  cityWardsList: string[];
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<City>(() => {
    const saved = localStorage.getItem('selectedCity');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Fallback to Gwalior
    return MASTER_CITIES.find(c => c.id === 'gwalior') || MASTER_CITIES[0];
  });

  const setSelectedCity = (newCity: City) => {
    setSelectedCityState(newCity);
    localStorage.setItem('selectedCity', JSON.stringify(newCity));
    localStorage.setItem('fixit_city', newCity.id);
    document.title = `FixItBharat - ${newCity.name}`;
  };

  useEffect(() => {
    document.title = `FixItBharat - ${selectedCity.name}`;
  }, [selectedCity]);

  const cityWardsList = getCityWards(selectedCity.id);

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, cityWardsList }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
