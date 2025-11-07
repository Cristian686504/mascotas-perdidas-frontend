import React, { useState, useEffect } from "react";
import { useMapbox } from "../../hooks/useMapbox";
import LostFormModal from "./lost-form-modal/LostFormModal";
import FoundFormModal from "./found-form-modal/FoundFormModal";
import FoundFromLostModal from "./found-from-lost-modal/FoundFromLostModal";
import PetInformationSidebar from "./pet-information-sidebar/PetInformationSidebar";
import FoundPetInformationSidebar from "./found-pet-sidebar/FoundPetInformationSidebar";
import MapFilters, { FilterOptions } from "./map-filters/MapFilters";
import { getPets, Pet, getFoundPets, FoundPet } from "../../api/mascota";
// @ts-ignore
import "./Map.css";
// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";

type MarkerType = "lost" | "found" | "foundFromLost";

const Map: React.FC = () => {
    const token =
        "pk.eyJ1IjoiY3Jpc3RpYW4xNDU2IiwiYSI6ImNtZDY2OTd4eTA2NTQya29jcHdxdjJ5bW0ifQ.Ror-evVNRJvXwcEJSRNffQ";

    const [isLostModalOpen, setIsLostModalOpen] = useState(false);
    const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);
    const [isFoundFromLostModalOpen, setIsFoundFromLostModalOpen] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<[number, number]>([0, 0]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [foundPets, setFoundPets] = useState<FoundPet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [selectedFoundPet, setSelectedFoundPet] = useState<FoundPet | null>(null);
    const [petForFoundReport, setPetForFoundReport] = useState<Pet | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFoundSidebarOpen, setIsFoundSidebarOpen] = useState(false);
    const [markerTypeToAdd, setMarkerTypeToAdd] = useState<MarkerType | null>(null);

    const [filters, setFilters] = useState<FilterOptions>({
        tipo_mascota: "",
        fecha_inicio: "",
        fecha_fin: "",
        tipo_reporte: "todos",
    });

    const fetchPets = async () => {
        try {
            setLoading(true);
            const [petsResponse, foundPetsResponse] = await Promise.all([
                getPets(),
                getFoundPets(),
            ]);
            setPets(petsResponse.data.data);
            setFoundPets(foundPetsResponse.data.data);
        } catch (error) {
            console.error("Error al cargar las mascotas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const filterPets = () => {
        let filteredPets = pets;
        let filteredFoundPets = foundPets;

        if (filters.tipo_mascota) {
            filteredPets = filteredPets.filter(
                (pet) => pet.tipo_mascota === filters.tipo_mascota
            );
            filteredFoundPets = filteredFoundPets.filter(
                (foundPet) => foundPet.tipo_mascota === filters.tipo_mascota
            );
        }

        if (filters.fecha_inicio) {
            filteredPets = filteredPets.filter(
                (pet) => new Date(pet.fecha_perdida) >= new Date(filters.fecha_inicio)
            );
            filteredFoundPets = filteredFoundPets.filter(
                (pet) => new Date(pet.fecha_encontrada) >= new Date(filters.fecha_inicio)
            );
        }

        if (filters.fecha_fin) {
            filteredPets = filteredPets.filter(
                (pet) => new Date(pet.fecha_perdida) <= new Date(filters.fecha_fin)
            );
            filteredFoundPets = filteredFoundPets.filter(
                (pet) => new Date(pet.fecha_encontrada) <= new Date(filters.fecha_fin)
            );
        }

        if (filters.tipo_reporte === "perdida") {
            return { pets: filteredPets, foundPets: [] };
        } else if (filters.tipo_reporte === "encontrada") {
            return { pets: [], foundPets: filteredFoundPets };
        }

        return { pets: filteredPets, foundPets: filteredFoundPets };
    };

    const { pets: filteredPets, foundPets: filteredFoundPets } = filterPets();

    const handleMarkerPlaced = (coords: [number, number]) => {
        setSelectedCoords(coords);
        if (markerTypeToAdd === "lost") {
            setIsLostModalOpen(true);
        } else if (markerTypeToAdd === "found") {
            setIsFoundModalOpen(true);
        } else if (markerTypeToAdd === "foundFromLost") {
            window.dispatchEvent(new CustomEvent('foundLocationSelected', {
                detail: { 
                    lostPetId: petForFoundReport?._id,
                    coordinates: coords
                }
            }));
            setMarkerTypeToAdd(null);
            setIsAddingMarker(false);
            setIsFoundFromLostModalOpen(true);
        }
    };

    const handlePetClick = (pet: Pet) => {
        setSelectedPet(pet);
        setSelectedFoundPet(null);
        setIsSidebarOpen(true);
        setIsFoundSidebarOpen(false);
    };

    const handleFoundPetClick = (foundPet: FoundPet) => {
        setSelectedFoundPet(foundPet);
        setSelectedPet(null);
        setIsFoundSidebarOpen(true);
        setIsSidebarOpen(false);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedPet(null);
        clearSelectedMarker();
    };

    const handleCloseFoundSidebar = () => {
        setIsFoundSidebarOpen(false);
        setSelectedFoundPet(null);
        clearSelectedMarker();
    };

    const handleMatchClick = (foundPetId: string, coordinates: [number, number]) => {
        const foundPet = foundPets.find(fp => fp._id === foundPetId);
        if (foundPet) {
            setIsSidebarOpen(false);
            setSelectedPet(null);
            
            flyToLocation(coordinates);
            
            setTimeout(() => {
                setSelectedFoundPet(foundPet);
                setIsFoundSidebarOpen(true);
            }, 500);
            
            clearSelectedMarker();
        }
    };

    const { mapContainer, isAddingMarker, setIsAddingMarker, removeTempMarker, clearSelectedMarker, flyToLocation } = useMapbox({
        token,
        center: [-58.08040986151055, -32.3169429908807],
        zoom: 14,
        onMarkerPlaced: handleMarkerPlaced,
        pets: filteredPets,
        foundPets: filteredFoundPets,
        onPetClick: handlePetClick,
        onFoundPetClick: handleFoundPetClick,
    });

    const handleModalSuccess = async () => {
        setIsLostModalOpen(false);
        setIsFoundModalOpen(false);
        setIsFoundFromLostModalOpen(false);
        setMarkerTypeToAdd(null);
        setPetForFoundReport(null);
        removeTempMarker();
        await fetchPets();
    };

    const handleModalClose = () => {
        setIsLostModalOpen(false);
        setIsFoundModalOpen(false);
        setIsFoundFromLostModalOpen(false);
        setMarkerTypeToAdd(null);
        setPetForFoundReport(null);
        removeTempMarker();
    };

    const startAddingMarker = (type: MarkerType) => {
        setMarkerTypeToAdd(type);
        setIsAddingMarker(true);
    };

    const handleFoundThisPet = () => {
        setPetForFoundReport(selectedPet);
        setIsSidebarOpen(false);
        setIsFoundFromLostModalOpen(true);
    };

    useEffect(() => {
        const handleSelectLocation = (e: any) => {
            setPetForFoundReport(selectedPet);
            setMarkerTypeToAdd("foundFromLost");
            setIsAddingMarker(true);
        };

        window.addEventListener('selectFoundLocation', handleSelectLocation as EventListener);
        return () => {
            window.removeEventListener('selectFoundLocation', handleSelectLocation as EventListener);
        };
    }, [selectedPet]);

    return (
        <div className="map-wrapper">
            <div className="map-controls">
                <div className="map-buttons">
                    <button
                        onClick={() => startAddingMarker("lost")}
                        disabled={isAddingMarker}
                        className={`add-marker-button lost ${isAddingMarker && markerTypeToAdd === "lost" ? "active" : ""}`}
                    >
                        {isAddingMarker && markerTypeToAdd === "lost" 
                            ? "Haz click en el mapa" 
                            : "Reportar Mascota Perdida"}
                    </button>
                    <button
                        onClick={() => startAddingMarker("found")}
                        disabled={isAddingMarker}
                        className={`add-marker-button found ${isAddingMarker && markerTypeToAdd === "found" ? "active" : ""}`}
                    >
                        {isAddingMarker && markerTypeToAdd === "found" 
                            ? "Haz click en el mapa" 
                            : "Reportar Mascota Encontrada"}
                    </button>
                </div>

                <MapFilters filters={filters} onFilterChange={setFilters} />
            </div>

            {loading && <div className="loading">Cargando mascotas...</div>}

            <div ref={mapContainer} className="map-container" />

            <LostFormModal
                isOpen={isLostModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                coordinates={selectedCoords}
            />

            <FoundFormModal
                isOpen={isFoundModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                coordinates={selectedCoords}
            />

            <PetInformationSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                pet={selectedPet}
                onFoundThisPet={handleFoundThisPet}
                onMatchClick={handleMatchClick}
            />

            <FoundPetInformationSidebar
                isOpen={isFoundSidebarOpen}
                onClose={handleCloseFoundSidebar}
                foundPet={selectedFoundPet}
            />

            <FoundFromLostModal
                isOpen={isFoundFromLostModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                lostPet={petForFoundReport}
            />
        </div>
    );
};

export default Map;