import { type TokenMetadataUI } from "@cartridge/marketplace";
import { createContext, ReactNode, useCallback, useContext } from "react";

export const MetadataFilterContext = createContext<MetadataFilterContextType>({
  onFilterChange(_tokensIds) {


  },
});
export type MetadataFilterContextType = {
  onFilterChange: (tokensIds: TokenMetadataUI[]) => void;
}

export function useFilters() {
  const ctx = useContext(MetadataFilterContext);
  return ctx;
}


export function MetadataFilterProvider({ children }: { children: ReactNode }) {
  const onFilterChange = useCallback((tokenIds: TokenMetadataUI[]) => {
    console.log('handleFilterChange called', tokenIds);
  }, []);

  return (
    <MetadataFilterContext.Provider value={{
      onFilterChange,
    }}>
      {children}
    </MetadataFilterContext.Provider>
  )
}
