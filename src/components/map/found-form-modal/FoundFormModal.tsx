import React, { useEffect, useState } from "react";
// @ts-ignore
import "./FoundFormModal.css";
import { createFoundPet } from "../../../api/mascota";

interface FoundFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    coordinates: [number, number];
}

const FoundFormModal: React.FC<FoundFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    coordinates,
}) => {
    const [formData, setFormData] = useState({
        petType: "",
        foundLocation: "",
        foundDate: "",
        contact: "",
        description: "",
    });

    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newFoundPet = new FormData();

            newFoundPet.append('tipo_mascota', formData.petType);
            newFoundPet.append('ubicacion_encontrada', formData.foundLocation);
            newFoundPet.append('fecha_encontrada', formData.foundDate);
            newFoundPet.append('contacto', formData.contact);
            newFoundPet.append('descripcion', formData.description);
            newFoundPet.append('coordenadas', JSON.stringify(coordinates));

            if (photo) {
                newFoundPet.append('foto_encontrada', photo);
            }

            await createFoundPet(newFoundPet);

            alert("¡Mascota encontrada reportada con éxito!");
            resetForm();
            onSuccess();
        } catch (error) {
            console.error("Error al crear el reporte:", error);
            alert("Hubo un error al enviar los datos. Intenta nuevamente.");
        }
    };

    const resetForm = () => {
        setFormData({
            petType: "",
            foundLocation: "",
            foundDate: "",
            contact: "",
            description: "",
        });
        setPhoto(null);
        setPhotoPreview("");
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        const fileInput = document.getElementById('photo') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Reportar Mascota Encontrada</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="petType">Tipo de mascota *</label>
                        <select
                            id="petType"
                            name="petType"
                            value={formData.petType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona una opción</option>
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="foundLocation">Ubicación donde se encontró *</label>
                        <input
                            type="text"
                            id="foundLocation"
                            name="foundLocation"
                            value={formData.foundLocation}
                            onChange={handleChange}
                            placeholder="Ej: Parque Central, cerca del lago"
                            required
                        />
                    </div>

                    <div className="coordinates-info">
                        <small>
                            Coordenadas: {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
                        </small>
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
                        <label htmlFor="description">Descripción</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe las características de la mascota: color, tamaño, señas particulares, estado de salud..."
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="photo">Foto de la mascota *</label>
                        <input
                            type="file"
                            id="photo"
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

export default FoundFormModal;
