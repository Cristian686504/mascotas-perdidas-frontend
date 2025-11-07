import React from "react";
import { FoundPet } from "../../../api/mascota";
// @ts-ignore
import "./FoundPetInformationSidebar.css";

interface FoundPetInformationSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    foundPet: FoundPet | null;
}

const API_URL = process.env.REACT_APP_API_URL || "";

const FoundPetInformationSidebar: React.FC<FoundPetInformationSidebarProps> = ({
    isOpen,
    onClose,
    foundPet,
}) => {
    if (!foundPet) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
        });
    };

    const getImageUrl = (path: string) => {
        return `${API_URL}/${path}`;
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? "active" : ""}`}
                onClick={onClose}
            />
            <div className={`pet-sidebar found ${isOpen ? "open" : ""}`}>
                <button className="close-button" onClick={onClose}>
                    ✕
                </button>

                <div className="pet-sidebar-content">
                    <div className="pet-images-carousel">
                        {foundPet.foto_encontrada ? (
                            <div className="carousel-container">
                                <img
                                    src={getImageUrl(foundPet.foto_encontrada)}
                                    alt="Mascota encontrada"
                                    className="pet-image"
                                />
                            </div>
                        ) : (
                            <div className="no-image">Sin foto disponible</div>
                        )}
                    </div>

                    <h2 className="pet-name">Mascota Encontrada</h2>

                    <div className="pet-details">
                        <div className="detail-item">
                            <span className="detail-label">Tipo:</span>
                            <span className="detail-value">{foundPet.tipo_mascota}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Fecha encontrada:</span>
                            <span className="detail-value">{formatDate(foundPet.fecha_encontrada)}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Ubicación:</span>
                            <span className="detail-value">{foundPet.ubicacion_encontrada}</span>
                        </div>

                        <div className="detail-item">
                            <span className="detail-label">Contacto:</span>
                            <span className="detail-value">{foundPet.contacto}</span>
                        </div>

                        {foundPet.descripcion && (
                            <div className="detail-item description">
                                <span className="detail-label">Descripción:</span>
                                <p className="detail-value">{foundPet.descripcion}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default FoundPetInformationSidebar;