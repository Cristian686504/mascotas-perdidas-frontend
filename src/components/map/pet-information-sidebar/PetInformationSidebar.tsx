import React, { useState, useEffect } from "react";
import { Pet, FoundPet, getFoundPetById } from "../../../api/mascota";
// @ts-ignore
import "./PetInformationSidebar.css";

interface PetInformationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    pet: Pet | null;
    onFoundThisPet?: () => void;
    onMatchClick?: (foundPetId: string, coordinates: [number, number]) => void;
}

const API_URL = process.env.REACT_APP_API_URL || "";

const PetInformationSidebar: React.FC<PetInformationSidebarProps> = ({
    isOpen,
    onClose,
    pet,
    onFoundThisPet,
    onMatchClick,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [possibleMatches, setPossibleMatches] = useState<FoundPet[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    useEffect(() => {
        setCurrentImageIndex(0);
    }, [pet?._id]);

    useEffect(() => {
        const fetchPossibleMatches = async () => {
            if (pet?.posibles_coincidencias && pet.posibles_coincidencias.length > 0) {
                setLoadingMatches(true);
                try {
                    const matches = await Promise.all(
                        pet.posibles_coincidencias.map(id => getFoundPetById(id))
                    );
                    setPossibleMatches(matches.map(response => response.data.data));
                } catch (error) {
                    console.error("Error loading possible matches:", error);
                } finally {
                    setLoadingMatches(false);
                }
            } else {
                setPossibleMatches([]);
            }
        };

        if (isOpen && pet) {
            fetchPossibleMatches();
        }
    }, [pet, isOpen]);

    if (!pet) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getImageUrl = (path: string) => {
        return `${API_URL}/${path}`;
    };

    const hasMultipleImages = pet.fotos_perdida && pet.fotos_perdida.length > 1;

    const nextImage = () => {
        if (pet.fotos_perdida) {
            setCurrentImageIndex((prev) =>
                prev === pet.fotos_perdida.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (pet.fotos_perdida) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? pet.fotos_perdida.length - 1 : prev - 1
            );
        }
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? "active" : ""}`}
                onClick={onClose}
            />
            <div className={`pet-sidebar ${isOpen ? "open" : ""}`}>
                <button className="close-button" onClick={onClose}>
                    ✕
                </button>

                <div className="pet-sidebar-content">
                    <div className="pet-images-carousel">
                        {pet.fotos_perdida && pet.fotos_perdida.length > 0 ? (
                            <>
                                <div className="carousel-container">
                                    <img
                                        src={getImageUrl(pet.fotos_perdida[currentImageIndex])}
                                        alt={`${pet.nombre} - foto ${currentImageIndex + 1}`}
                                        className="pet-image"
                                    />

                                    {hasMultipleImages && (
                                        <>
                                            <button className="carousel-button prev" onClick={prevImage}>
                                                ‹
                                            </button>
                                            <button className="carousel-button next" onClick={nextImage}>
                                                ›
                                            </button>

                                            <div className="carousel-indicators">
                                                {pet.fotos_perdida.map((_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`indicator ${index === currentImageIndex ? "active" : ""}`}
                                                        onClick={() => setCurrentImageIndex(index)}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="no-image">Sin foto disponible</div>
                        )}
                    </div>

                    <h2 className="pet-name">{pet.nombre}</h2>

                    {onFoundThisPet && (
                        <button className="found-this-pet-button" onClick={onFoundThisPet}>
                            ¡Encontré esta mascota!
                        </button>
                    )}

                    <div className="pet-details">
                        <div className="detail-item">
                            <span className="detail-label">Tipo:</span>
                            <span className="detail-value">{pet.tipo_mascota}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Fecha perdida:</span>
                            <span className="detail-value">{formatDate(pet.fecha_perdida)}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Ubicación:</span>
                            <span className="detail-value">{pet.ubicacion_perdida}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Contacto:</span>
                            <span className="detail-value">{pet.contacto}</span>
                        </div>

                        {pet.descripcion && (
                            <div className="detail-item description">
                                <span className="detail-label">Descripción:</span>
                                <p className="detail-value">{pet.descripcion}</p>
                            </div>
                        )}
                    </div>

                    {possibleMatches.length > 0 && (
                        <div className="possible-matches">
                            <h3 className="matches-title">Posibles Coincidencias ({possibleMatches.length})</h3>
                            <p className="matches-subtitle">Personas que reportaron haber encontrado esta mascota:</p>
                            {loadingMatches ? (
                                <p>Cargando...</p>
                            ) : (
                                <div className="matches-list">
                                    {possibleMatches.map((match) => (
                                        <div 
                                            key={match._id} 
                                            className="match-card clickable"
                                            onClick={() => onMatchClick?.(match._id, match.coordenadas)}
                                        >
                                            {match.foto_encontrada && (
                                                <img 
                                                    src={getImageUrl(match.foto_encontrada)} 
                                                    alt="Mascota encontrada"
                                                    className="match-photo"
                                                />
                                            )}
                                            <div className="match-info">
                                                <p><strong>Encontrada:</strong> {formatDate(match.fecha_encontrada)}</p>
                                                <p><strong>Ubicación:</strong> {match.ubicacion_encontrada}</p>
                                                <p><strong>Contacto:</strong> {match.contacto}</p>
                                                {match.descripcion && (
                                                    <p><strong>Info:</strong> {match.descripcion}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PetInformationSidebar;