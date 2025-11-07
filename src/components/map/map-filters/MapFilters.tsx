import React from "react";
// @ts-ignore
import "./MapFilters.css";

export interface FilterOptions {
    tipo_mascota: string;
    fecha_inicio: string;
    fecha_fin: string;
    tipo_reporte: "perdida" | "encontrada" | "todos";
}

interface MapFiltersProps {
    filters: FilterOptions;
    onFilterChange: (filters: FilterOptions) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ filters, onFilterChange }) => {
    const handleChange = (field: keyof FilterOptions, value: string) => {
        onFilterChange({
            ...filters,
            [field]: value,
        });
    };

    const clearFilters = () => {
        onFilterChange({
            tipo_mascota: "",
            fecha_inicio: "",
            fecha_fin: "",
            tipo_reporte: "todos",
        });
    };

    return (
        <div className="map-filters">
            <div className="filters-header">
                <h3>Filtros</h3>
                <button onClick={clearFilters} className="clear-filters-btn">
                    Limpiar
                </button>
            </div>

            <div className="filter-group">
                <label htmlFor="tipo_reporte">Tipo de reporte</label>
                <select
                    id="tipo_reporte"
                    value={filters.tipo_reporte}
                    onChange={(e) => handleChange("tipo_reporte", e.target.value)}
                >
                    <option value="todos">Todos</option>
                    <option value="perdida">Perdidas</option>
                    <option value="encontrada">Encontradas</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="tipo_mascota">Tipo de mascota</label>
                <select
                    id="tipo_mascota"
                    value={filters.tipo_mascota}
                    onChange={(e) => handleChange("tipo_mascota", e.target.value)}
                >
                    <option value="">Todos</option>
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                </select>
            </div>

            <div className="filter-group">
                <label htmlFor="fecha_inicio">Fecha desde</label>
                <input
                    type="date"
                    id="fecha_inicio"
                    value={filters.fecha_inicio}
                    onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                />
            </div>

            <div className="filter-group">
                <label htmlFor="fecha_fin">Fecha hasta</label>
                <input
                    type="date"
                    id="fecha_fin"
                    value={filters.fecha_fin}
                    onChange={(e) => handleChange("fecha_fin", e.target.value)}
                />
            </div>
        </div>
    );
};

export default MapFilters;