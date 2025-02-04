import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import React from "react";

interface SearchPostProps {
  handleSearch: (searchTerm: string) => void;
  isSearching: boolean;
}

const SearchPost: React.FC<SearchPostProps> = ({
  handleSearch,
  isSearching,
}) => {
  return (
    <TextField
      placeholder="Search posts"
      sx={{
        mb: 2,
        width: "100%",
        bgcolor: "white",
      }}
      onChange={(e) => handleSearch(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isSearching && <CircularProgress size={20} />}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchPost;
