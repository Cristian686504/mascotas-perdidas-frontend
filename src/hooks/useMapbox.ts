import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Pet } from "../api/mascota";
import { clear } from "console";

interface UseMapboxOptions {
    token: string;
    center?: [number, number];
    zoom?: number;
    style?: string;
    onMarkerPlaced?: (coords: [number, number]) => void;
    pets?: Pet[];
    onPetClick?: (pet: Pet) => void;
}

export function useMapbox({
    token,
    center = [-58.0804, -32.3169],
    zoom = 14,
    style = "mapbox://styles/mapbox/streets-v12",
    onMarkerPlaced,
    pets = [],
    onPetClick,
}: UseMapboxOptions) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isAddingMarker, setIsAddingMarker] = useState(false);
    const [markerCoords, setMarkerCoords] = useState<[number, number] | null>(null);
    const [tempMarker, setTempMarker] = useState<mapboxgl.Marker | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<HTMLElement | null>(null);

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
        if (!map.current || !pets || pets.length === 0) return;

        pets.forEach((pet) => {
            const marker = new mapboxgl.Marker({
                color: "#FF0000",
            })
                .setLngLat(pet.coordenadas)
                .addTo(map.current!);

            const markerElement = marker.getElement();

            markerElement.addEventListener('click', () => {
                // Remover la clase del marker previamente seleccionado
                if (selectedMarker) {
                    selectedMarker.classList.remove('marker-selected');
                }

                // Agregar la clase al marker actual
                markerElement.classList.add('marker-selected');
                setSelectedMarker(markerElement);

                if (onPetClick) {
                    onPetClick(pet);
                }
            });
        });
    }, [map, pets, onPetClick, selectedMarker]);

    const clearSelectedMarker = () => {
        if (selectedMarker) {
            selectedMarker.classList.remove("marker-selected");
            setSelectedMarker(null);
        }
    };


    return { mapContainer, map, isAddingMarker, setIsAddingMarker, markerCoords, removeTempMarker, clearSelectedMarker };
}