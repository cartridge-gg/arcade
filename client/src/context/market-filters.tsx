import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type MetadataAttribute = {
  trait_type: string;
  value: string;
  tokens: string[];
};

/**
 * Interface defining the shape of the Filters context.
 */
interface MarketFiltersContextType {
  /** The Filters client instance */
  active: number;
  allMetadata: MetadataAttribute[];
  filteredMetadata: MetadataAttribute[];
  clearable: boolean;
  empty: boolean;
  isActive: (trait: string, property: string) => boolean;
  setActive: (active: number) => void;
  setAllMetadata: (metadata: MetadataAttribute[]) => void;
  setFilteredMetadata: (metadata: MetadataAttribute[]) => void;
  isSelected: (attributes: { trait_type: string; value: string }[]) => boolean;
  addSelected: (trait: string, property: string, value: boolean) => void;
  resetSelected: () => void;
}
/**
 * React context for sharing Filters-related data throughout the application.
 */
export const MarketFiltersContext =
  createContext<MarketFiltersContextType | null>(null);

/**
 * Provider component that makes Filters context available to child components.
 *
 * @param props.children - Child components that will have access to the Filters context
 * @throws {Error} If MarketFiltersProvider is used more than once in the component tree
 */
export const MarketFiltersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const currentValue = useContext(MarketFiltersContext);

  if (currentValue) {
    throw new Error("MarketFiltersProvider can only be used once");
  }

  const [active, setActive] = useState<number>(0);
  const [allMetadata, setAllMetadata] = useState<MetadataAttribute[]>([]);
  const [filteredMetadata, setFilteredMetadata] = useState<MetadataAttribute[]>(
    [],
  );
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

  const clearable = useMemo(() => {
    return Object.values(selected).filter((value) => !!value).length > 0;
  }, [selected]);

  const empty = useMemo(() => {
    return Object.values(selected).filter((value) => !!value).length === 0;
  }, [selected]);

  const isActive = useCallback(
    (trait: string, property: string) => {
      return selected[`${trait}-${property}`] || false;
    },
    [selected],
  );

  const isSelected = useCallback(
    (attributes: { trait_type: string; value: string }[]) => {
      // All selected must exist in the attributes
      const actives = Object.keys(selected).filter((key) => selected[key]);
      return (
        actives.filter((key) =>
          attributes.some(
            (attribute) => key === `${attribute.trait_type}-${attribute.value}`,
          ),
        ).length === actives.length
      );
    },
    [selected],
  );

  const addSelected = useCallback(
    (trait: string, property: string, value: boolean) => {
      setSelected((prev) => ({ ...prev, [`${trait}-${property}`]: value }));
    },
    [],
  );

  const resetSelected = useCallback(() => {
    setSelected({});
  }, []);

  return (
    <MarketFiltersContext.Provider
      value={{
        active,
        allMetadata,
        filteredMetadata,
        clearable,
        empty,
        isActive,
        setActive,
        setAllMetadata,
        setFilteredMetadata,
        isSelected,
        addSelected,
        resetSelected,
      }}
    >
      {children}
    </MarketFiltersContext.Provider>
  );
};
