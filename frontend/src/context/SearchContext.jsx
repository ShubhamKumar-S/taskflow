import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
  }, []);

  const value = useMemo(
    () => ({
      searchInput,
      searchQuery,
      setSearchInput,
      clearSearch
    }),
    [clearSearch, searchInput, searchQuery]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);

  if (!context) {
    throw new Error('useSearch must be used inside SearchProvider');
  }

  return context;
}
