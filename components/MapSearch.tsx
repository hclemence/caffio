"use client";
import { useSearchBoxCore } from "@mapbox/search-js-react";
import type { SearchBoxSuggestion } from "@mapbox/search-js-core";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { Loader2, MapPin, Coffee, Search, X } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";

import { Command as CommandPrimitive } from "cmdk";
import { formatDistance } from "@/lib/utils";
import type { CafeHybrid } from "../types/cafes";

export interface AddressType {
  address1: string;
  address2: string;
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  lat: number;
  lng: number;
}

interface AddressAutoCompleteProps {
  address: AddressType;
  setAddress: (address: AddressType) => void;
  searchInput: string;
  setSearchInput: (searchInput: string) => void;
  dialogTitle: string;
  showInlineError?: boolean;
  placeholder?: string;
  cafes: CafeHybrid;
  flyTo: (lng: number, lat: number) => void;
}

const MapSearch: React.FC<AddressAutoCompleteProps> = ({
  address,
  setAddress,
  dialogTitle,
  showInlineError = true,
  searchInput,
  setSearchInput,
  placeholder,
  cafes,
  flyTo,
}) => {
  const searchBoxCore = useSearchBoxCore({
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [addressData, setAddressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (addressData?.data.address) {
      setAddress(addressData.data.address as AddressType);
    }
  }, [addressData, setAddress]);

  return (
    <>
      <AddressAutoCompleteInput
        searchInput={searchInput}
        longitude={address.lng}
        latitude={address.lat}
        setSearchInput={setSearchInput}
        selectedPlaceId={selectedPlaceId}
        setSelectedPlaceId={setSelectedPlaceId}
        setIsOpenDialog={setIsOpen}
        showInlineError={showInlineError}
        placeholder={placeholder}
        searchBoxCore={searchBoxCore}
        cafes={cafes}
        flyTo={flyTo}
      />
    </>
  );
};

interface CommonProps {
  selectedPlaceId: string;
  setSelectedPlaceId: (placeId: string) => void;
  setIsOpenDialog: (isOpen: boolean) => void;
  showInlineError?: boolean;
  searchInput: string;
  longitude: number;
  latitude: number;
  setSearchInput: (searchInput: string) => void;
  placeholder?: string;
  searchBoxCore: ReturnType<typeof useSearchBoxCore>;
}

function AddressAutoCompleteInput(props: CommonProps & { cafes: CafeHybrid; flyTo: (lng: number, lat: number) => void }) {
  const {
    setSelectedPlaceId,
    selectedPlaceId,
    setIsOpenDialog,
    showInlineError,
    searchInput,
    longitude,
    latitude,
    setSearchInput,
    placeholder,
    searchBoxCore,
    cafes,
    flyTo,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const handleInputValueChange = (value: string) => {
    setSearchInput(value);
    if (selectedPlaceId) {
      setSelectedPlaceId("");
    }
  };

  const debouncedSearchInput = useDebounce(searchInput, 500);

  const [autocompleteData, setAutocompleteData] = useState<any>(null);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);

  useEffect(() => {
    if (!debouncedSearchInput) return;
    setAutocompleteLoading(true);

    searchBoxCore
      .suggest(debouncedSearchInput, {
        sessionToken: "your-session-token",
        proximity: [longitude, latitude],
        types:
          "address,poi,locality,neighborhood,street,region,country,postcode",
      })
      .then((response) => {
        console.log(response);
        setAutocompleteData(response);
        setAutocompleteLoading(false);
      })
      .catch(() => setAutocompleteLoading(false));
  }, [debouncedSearchInput]);

  async function fetchCoordinates(
    suggestion: SearchBoxSuggestion
  ): Promise<[number, number] | null> {
    try {
      const data = await searchBoxCore.retrieve(suggestion, {
        sessionToken: "your-session-token",
      });
      const coords = data?.features?.[0]?.geometry?.coordinates;
      return Array.isArray(coords) ? (coords as [number, number]) : null;
    } catch (error) {
      console.error("Error retrieving coordinates:", error);
      return null;
    }
  }

  const predictions = autocompleteData?.suggestions || [];

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div className="flex w-full items-center justify-between rounded-lg border bg-background ring-offset-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 relative">
        <CommandPrimitive.Input
          ref={inputRef}
          value={searchInput}
          onValueChange={handleInputValueChange}
          onBlur={close}
          onFocus={open}
          placeholder={placeholder || "Enter address"}
          className="w-full p-3 rounded-lg outline-none pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {selectedPlaceId ? (
            <button
              type="button"
              onClick={() => {
                setSelectedPlaceId("");
                setSearchInput("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded hover:bg-accent"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </span>
      </div>

      {isOpen && searchInput !== "" && selectedPlaceId === "" && (
        <div className="relative animate-in fade-in-0 zoom-in-95 h-auto">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative h-auto z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md bg-background">
                {autocompleteLoading ? (
                  <div className="h-28 flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {predictions.map((suggestion: SearchBoxSuggestion) => {
                      const isCafe = !!cafes.byId[suggestion.mapbox_id];
                      console.log("suggestion.mapbox_id", suggestion.mapbox_id);
                      console.log("cafes.byId keys", Object.keys(cafes.byId));
                      console.log(
                        "cafes.byId[suggestion.mapbox_id]",
                        cafes.byId[suggestion.mapbox_id]
                      );
                      return (
                        <CommandPrimitive.Item
                          key={suggestion.mapbox_id}
                          value={suggestion.mapbox_id}
                          onSelect={() => {
                            const inputValue =
                              suggestion.name +
                              (suggestion.place_formatted
                                ? ", " + suggestion.place_formatted
                                : "");
                            setSearchInput(inputValue);
                            setSelectedPlaceId(suggestion.mapbox_id);
                            fetchCoordinates(suggestion).then((coords) => {
                              if (coords) {
                                flyTo(coords[0], coords[1]);
                              }
                            });
                            setIsOpenDialog(true);
                            inputRef.current?.blur();
                          }}
                          className="flex cursor-pointer gap-4 h-max p-2 px-3 rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground items-center justify-between"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <div className="flex items-center">
                            {isCafe ? (
                              <Coffee className="ml-2 size-[18px] text-yellow-700" />
                            ) : (
                              <MapPin className="ml-2 size-[18px] text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex  w-full items-center justify-between">
                            <div>
                              <span className="font-medium flex items-center gap-2">
                                {suggestion.name}
                              </span>
                              <span
                                className="text-xs text-muted-foreground truncate max-w-[200px] block"
                                title={
                                  suggestion.place_formatted ||
                                  suggestion.full_address
                                }
                              >
                                {suggestion.place_formatted ||
                                  suggestion.full_address}
                              </span>
                            </div>
                            {typeof suggestion.distance === "number" && (
                              <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                                {formatDistance(suggestion.distance)}
                              </span>
                            )}
                          </div>
                        </CommandPrimitive.Item>
                      );
                    })}
                  </>
                )}

                <CommandEmpty>
                  {!autocompleteLoading &&
                    predictions.length === 0 &&
                    searchInput.trim() !== "" && (
                      <div className="py-4 flex items-center justify-center">
                        No address found
                      </div>
                    )}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}

export default MapSearch;
