import React, { useState, useEffect } from "react";
// @ts-ignore
import "../found-form-modal/FoundFormModal.css";
import { reportFoundFromLost } from "../../../api/mascota";
import { Pet } from "../../../api/mascota";

interface FoundFromLostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    lostPet: Pet | null;
}

const FoundFromLostModal: React.FC<FoundFromLostModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    lostPet,
}) => {
    const [formData, setFormData] = useState({
        foundLocation: "",
        foundDate: "",
        contact: "",
        additionalInfo: "",
    });

    const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>("");

    const resetForm = () => {
        setFormData({
            foundLocation: "",
            foundDate: "",
            contact: "",
            additionalInfo: "",
        });
        setPhoto(null);
        setPhotoPreview("");
        setCoordinates([0, 0]);
        setIsSelectingLocation(false);
        const fileInput = document.getElementById('foundPhoto') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!lostPet) return;

        if (coordinates[0] === 0 && coordinates[1] === 0) {
            alert("Por favor selecciona la ubicación donde encontraste la mascota en el mapa.");
            return;
        }

        try {
            const foundPetData = new FormData();

            foundPetData.append('ubicacion_encontrada', formData.foundLocation);
            foundPetData.append('fecha_encontrada', formData.foundDate);
            foundPetData.append('contacto', formData.contact);
            foundPetData.append('descripcion', formData.additionalInfo);
            foundPetData.append('coordenadas', JSON.stringify(coordinates));

            if (photo) {
                foundPetData.append('foto_encontrada', photo);
            }

            await reportFoundFromLost(lostPet._id, foundPetData);

            alert("¡Reporte enviado con éxito!");
            resetForm();
            onSuccess();
        } catch (error) {
            console.error("Error al crear el reporte:", error);
            alert("Hubo un error al enviar los datos. Intenta nuevamente.");
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPhoto(null);
        setPhotoPreview("");
        const fileInput = document.getElementById('foundPhoto') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSelectLocation = () => {
        setIsSelectingLocation(true);
        onClose(); 
        window.dispatchEvent(new CustomEvent('selectFoundLocation', { 
            detail: { lostPetId: lostPet?._id } 
        }));
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleLocationSelected = (e: any) => {
            if (e.detail.lostPetId === lostPet?._id) {
                setCoordinates(e.detail.coordinates);
                setIsSelectingLocation(false);
            }
        };

        window.addEventListener('foundLocationSelected', handleLocationSelected as EventListener);
        return () => {
            window.removeEventListener('foundLocationSelected', handleLocationSelected as EventListener);
        };
    }, [lostPet?._id]);

    if (!isOpen || !lostPet) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>¡Encontré esta mascota!</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="lost-pet-reference">
                    <h3>Mascota perdida: {lostPet.nombre}</h3>
                    <p>Tipo: {lostPet.tipo_mascota}</p>
                    {lostPet.fotos_perdida && lostPet.fotos_perdida.length > 0 && (
                        <img 
                            src={`${process.env.REACT_APP_API_URL}/${lostPet.fotos_perdida[0]}`} 
                            alt={lostPet.nombre}
                            className="reference-photo"
                        />
                    )}
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Ubicación donde se encontró *</label>
                        <button 
                            type="button" 
                            onClick={handleSelectLocation}
                            className="select-location-button"
                        >
                            {coordinates[0] !== 0 && coordinates[1] !== 0 
                                ? `Ubicación seleccionada: ${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`
                                : "Seleccionar en el mapa"}
                        </button>
                        <input
                            type="text"
                            name="foundLocation"
                            value={formData.foundLocation}
                            onChange={handleChange}
                            placeholder="Ej: Parque Central, cerca del lago"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="foundDate">Fecha en que se encontró *</label>
                        <input
                            type="date"
                            id="foundDate"
                            name="foundDate"
                            value={formData.foundDate}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact">Tu contacto *</label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="Teléfono o email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="additionalInfo">Información adicional</label>
                        <textarea
                            id="additionalInfo"
                            name="additionalInfo"
                            value={formData.additionalInfo}
                            onChange={handleChange}
                            rows={4}
                            placeholder="¿Hay algo más que debamos saber? Estado de la mascota, ubicación exacta, etc."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="foundPhoto">Foto de la mascota encontrada *</label>
                        <input
                            type="file"
                            id="foundPhoto"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            required={!photo}
                        />
                        {photoPreview && (
                            <div className="photo-previews">
                                <div className="photo-preview">
                                    <img src={photoPreview} alt="Preview" />
                                    <button
                                        type="button"
                                        className="remove-photo"
                                        onClick={removePhoto}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancelar
                        </button>
                        <button type="submit" className="submit-button">
                            Reportar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FoundFromLostModal;