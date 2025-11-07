import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Pet, FoundPet } from "../api/mascota";

interface UseMapboxOptions {
    token: string;
    center?: [number, number];
    zoom?: number;
    style?: string;
    onMarkerPlaced?: (coords: [number, number]) => void;
    pets?: Pet[];
    foundPets?: FoundPet[];
    onPetClick?: (pet: Pet) => void;
    onFoundPetClick?: (foundPet: FoundPet) => void;
}

export function useMapbox({
    token,
    center = [-58.0804, -32.3169],
    zoom = 14,
    style = "mapbox://styles/mapbox/streets-v12",
    onMarkerPlaced,
    pets = [],
    foundPets = [],
    onPetClick,
    onFoundPetClick,
}: UseMapboxOptions) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isAddingMarker, setIsAddingMarker] = useState(false);
    const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(null);
    const [tempMarker, setTempMarker] = useState<mapboxgl.Marker | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<HTMLElement | null>(null);
    const petMarkers = useRef<mapboxgl.Marker[]>([]);
    const foundPetMarkers = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style,
            center,
            zoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl());
    }, [token, center, zoom, style]);

    useEffect(() => {
        if (!map.current) return;

        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            if (isAddingMarker) {
                const coords: [number, number] = [e.lngLat.lng, e.lngLat.lat];

                const marker = new mapboxgl.Marker({
                    color: "#FF0000",
                })
                    .setLngLat(coords)
                    .addTo(map.current!);

                setTempMarker(marker);
                setIsAddingMarker(false);
                setMarkerCoords(coords);

                if (map.current) {
                    map.current.getCanvas().style.cursor = "";
                }

                if (onMarkerPlaced) {
                    onMarkerPlaced(coords);
                }
            }
        };

        map.current.on("click", handleClick);

        return () => {
            map.current?.off("click", handleClick);
        };
    }, [isAddingMarker, onMarkerPlaced]);

    const removeTempMarker = () => {
        if (tempMarker) {
            tempMarker.remove();
            setTempMarker(null);
        }
    };

    useEffect(() => {
        if (map.current) {
            map.current.getCanvas().style.cursor = isAddingMarker ? "crosshair" : "";
        }
    }, [isAddingMarker]);

    useEffect(() => {
        if (!map.current) return;

        petMarkers.current.forEach(marker => marker.remove());
        petMarkers.current = [];

        pets.forEach((pet) => {
            const marker = new mapboxgl.Marker({
                color: "#FF0000",
            })
                .setLngLat(pet.coordenadas)
                .addTo(map.current!);

            petMarkers.current.push(marker);

            const markerElement = marker.getElement();
            markerElement.style.cursor = "pointer";

            markerElement.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (selectedMarker) {
                    selectedMarker.classList.remove('marker-selected');
                }

                markerElement.classList.add('marker-selected');
                setSelectedMarker(markerElement);

                if (onPetClick) {
                    onPetClick(pet);
                }
            });
        });
    }, [pets, onPetClick]);

    useEffect(() => {
        if (!map.current) return;

        foundPetMarkers.current.forEach(marker => marker.remove());
        foundPetMarkers.current = [];

        foundPets.forEach((foundPet) => {
            const marker = new mapboxgl.Marker({
                color: "#28a745",
            })
                .setLngLat(foundPet.coordenadas)
                .addTo(map.current!);

            foundPetMarkers.current.push(marker);

            const markerElement = marker.getElement();
            markerElement.style.cursor = "pointer";

            markerElement.addEventListener('click', (e) => {
                e.stopPropagation();

                if (selectedMarker) {
                    selectedMarker.classList.remove('marker-selected');
                }

                markerElement.classList.add('marker-selected');
                setSelectedMarker(markerElement);

                if (onFoundPetClick) {
                    onFoundPetClick(foundPet);
                }
            });
        });
    }, [foundPets, onFoundPetClick]);

    const clearSelectedMarker = () => {
        if (selectedMarker) {
            selectedMarker.classList.remove("marker-selected");
            setSelectedMarker(null);
        }
    };

    const flyToLocation = (coordinates: [number, number], zoomLevel: number = 16) => {
        if (map.current) {
            map.current.flyTo({
                center: coordinates,
                zoom: zoomLevel,
                speed: 1.2,
                curve: 1.42,
                easing: (t) => t,
                essential: true
            });
        }
    };

    return { 
        mapContainer, 
        map, 
        isAddingMarker, 
        setIsAddingMarker, 
        markerCoords, 
        removeTempMarker, 
        clearSelectedMarker,
        flyToLocation
    };
}