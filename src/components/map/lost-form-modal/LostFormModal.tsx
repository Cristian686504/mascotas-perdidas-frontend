import React, { useState, useEffect } from "react";
// @ts-ignore
import "./LostFormModal.css";
import { createPet } from "../../../api/mascota";

interface LostFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    coordinates: [number, number];
}

const LostFormModal: React.FC<LostFormModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    coordinates,
}) => {
    const [formData, setFormData] = useState({
        petName: "",
        petType: "",
        contact: "",
        lossLocation: "",
        lossDate: "",
        description: "",
    });

    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const resetForm = () => {
        setFormData({
            petName: "",
            petType: "",
            contact: "",
            lossLocation: "",
            lossDate: "",
            description: "",
        });
        setPhotos([]);
        setPhotoPreviews([]);
        const fileInput = document.getElementById('photos') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newPet = new FormData();

            // Agregar campos de texto
            newPet.append('nombre', formData.petName);
            newPet.append('tipo_mascota', formData.petType);
            newPet.append('contacto', formData.contact);
            newPet.append('ubicacion_perdida', formData.lossLocation);
            newPet.append('fecha_perdida', formData.lossDate);
            newPet.append('descripcion', formData.description);
            newPet.append('coordenadas', JSON.stringify(coordinates));

            // Agregar las fotos como archivos
            photos.forEach((photo, index) => {
                newPet.append('fotos_perdida', photo);
            });

            const response = await createPet(newPet);

            alert("¡Mascota reportada con éxito!");
            resetForm();
            onSuccess();
        } catch (error) {
            console.error("Error al crear la mascota:", error);
            alert("Hubo un error al enviar los datos. Intenta nuevamente.");
        }
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
        const files = Array.from(e.target.files || []);

        // Limitar a 5 fotos máximo
        if (photos.length + files.length > 5) {
            alert("Máximo 5 fotos permitidas");
            return;
        }

        setPhotos([...photos, ...files]);

        // Crear previsualizaciones
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
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
                    <h2>Reportar Mascota Perdida</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="petName">Nombre de la mascota *</label>
                        <input
                            type="text"
                            id="petName"
                            name="petName"
                            value={formData.petName}
                            onChange={handleChange}
                            placeholder="Ej: Max"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="petType">Tipo *</label>
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
                        <label htmlFor="contact">Contacto *</label>
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
                        <label htmlFor="lossLocation">Ubicación de pérdida *</label>
                        <input
                            type="text"
                            id="lossLocation"
                            name="lossLocation"
                            value={formData.lossLocation}
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
                        <label htmlFor="lossDate">Fecha de pérdida *</label>
                        <input
                            type="date"
                            id="lossDate"
                            name="lossDate"
                            value={formData.lossDate}
                            onChange={handleChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Descripción *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe las características de tu mascota: color, tamaño, señas particulares..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="photos">Fotos (máximo 5)</label>
                        <input
                            type="file"
                            id="photos"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            disabled={photos.length >= 5}
                        />
                        {photos.length > 0 && (
                            <div className="photo-previews">
                                {photoPreviews.map((preview, index) => (
                                    <div key={index} className="photo-preview">
                                        <img src={preview} alt={`Preview ${index + 1}`} />
                                        <button
                                            type="button"
                                            className="remove-photo"
                                            onClick={() => removePhoto(index)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
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

export default LostFormModal;