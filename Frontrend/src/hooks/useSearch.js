import { useState } from "react";

export const useSearch = (initialTerm = "") => {
  const [searchTerm, setSearchTerm] = useState(initialTerm);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const resetSearch = () => setSearchTerm("");

  return { searchTerm, handleSearchChange, resetSearch };
};
