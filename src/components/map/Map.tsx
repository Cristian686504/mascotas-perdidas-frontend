import React, { useState, useEffect } from "react";
import { useMapbox } from "../../hooks/useMapbox";
import LostFormModal from "./lost-form-modal/LostFormModal";
import PetInformationSidebar from "./pet-information-sidebar/PetInformationSidebar"; // Importar el sidebar
import { getPets, Pet } from "../../api/mascota";
import "./Map.css";
import "mapbox-gl/dist/mapbox-gl.css";

const Map: React.FC = () => {
    const token =
        "pk.eyJ1IjoiY3Jpc3RpYW4xNDU2IiwiYSI6ImNtZDY2OTd4eTA2NTQya29jcHdxdjJ5bW0ifQ.Ror-evVNRJvXwcEJSRNffQ";

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoords, setSelectedCoords] = useState<[number, number]>([0, 0]);
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null); // Estado para la mascota seleccionada
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para el sidebar

    const fetchPets = async () => {
        try {
            setLoading(true);
            const response = await getPets();
            console.log(response.data)
            setPets(response.data.data);
        } catch (error) {
            console.error("Error al cargar las mascotas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);


    const handleMarkerPlaced = (coords: [number, number]) => {
        setSelectedCoords(coords);
        setIsModalOpen(true);
    };

    const handlePetClick = (pet: Pet) => {
        setSelectedPet(pet);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedPet(null);
        clearSelectedMarker();
    };

    const { mapContainer, isAddingMarker, setIsAddingMarker, removeTempMarker, clearSelectedMarker  } = useMapbox({
        token,
        center: [-58.08040986151055, -32.3169429908807],
        zoom: 14,
        onMarkerPlaced: handleMarkerPlaced,
        pets: pets,
        onPetClick: handlePetClick,
    });

    const handleModalSuccess = async () => {
        setIsModalOpen(false);
        await fetchPets();
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        removeTempMarker();
    };

    return (
        <div className="map-wrapper">
            <button
                onClick={() => setIsAddingMarker(true)}
                disabled={isAddingMarker}
                className={`add-marker-button ${isAddingMarker ? "active" : ""}`}
            >
                {isAddingMarker ? "Haz click en el mapa" : "Agrega tu mascota perdida"}
            </button>
            {loading && <div className="loading">Cargando mascotas...</div>}

            <div ref={mapContainer} className="map-container" />

            <LostFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                coordinates={selectedCoords}
            />

            <PetInformationSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                pet={selectedPet}
            />
        </div>
    );
};

export default Map;