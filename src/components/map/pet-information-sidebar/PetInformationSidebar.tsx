import React, { useState, useEffect } from "react";
import { Pet } from "../../../api/mascota";
import "./PetInformationSidebar.css";

interface PetInformationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    pet: Pet | null;
}

const PetInformationSidebar: React.FC<PetInformationSidebarProps> = ({
    isOpen,
    onClose,
    pet,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reset image index when pet changes - MOVER ANTES DEL RETURN
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [pet?._id]);

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
        // Construir la URL completa
        return `http://localhost:3000/${path}`;
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
                </div>
            </div>
        </>
    );
};

export default PetInformationSidebar;