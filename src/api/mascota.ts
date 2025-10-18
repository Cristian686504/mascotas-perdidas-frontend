import axios, { AxiosResponse } from "axios";

const API_URL = "http://localhost:3000";

export interface Pet {
  _id: string;
  nombre: string;
  fotos_perdida: string[];
  tipo_mascota: string;
  contacto: string;
  ubicacion_perdida: string;
  fecha_perdida: string;
  descripcion: string;
  coordenadas: [number, number];
}

interface PetsResponse {
  data: Pet[];
}

export const getPets = async (): Promise<AxiosResponse<PetsResponse>> => {
  return axios.get<PetsResponse>(`${API_URL}/pets`);
};

export const getPetById = async (id: number): Promise<AxiosResponse<Pet>> => {
  return axios.get<Pet>(`${API_URL}/pets/${id}`);
};

export const createPet = async (formData: FormData) => {
  return await axios.post(`${API_URL}/pets`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
