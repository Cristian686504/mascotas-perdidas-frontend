import axios, { AxiosResponse } from "axios";

const API_URL = process.env.REACT_APP_API_URL || "";

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
  posibles_coincidencias?: string[];
}

export interface FoundPet {
  _id: string;
  foto_encontrada: string;
  tipo_mascota: string;
  ubicacion_encontrada: string;
  fecha_encontrada: string;
  contacto: string;
  descripcion?: string;
  coordenadas: [number, number];
  mascota_original?: string;
  nombre_original?: string;
  fotos_originales?: string[];
}

interface PetsResponse {
  data: Pet[];
}

interface FoundPetsResponse {
  data: FoundPet[];
}

interface FoundPetResponse {
  data: FoundPet;
}

export const getPets = async (): Promise<AxiosResponse<PetsResponse>> => {
  return axios.get<PetsResponse>(`${API_URL}/pets`);
};

export const getFoundPets = async (): Promise<AxiosResponse<FoundPetsResponse>> => {
  return axios.get<FoundPetsResponse>(`${API_URL}/found-pets`);
};

export const getPetById = async (id: string): Promise<AxiosResponse<Pet>> => {
  return axios.get<Pet>(`${API_URL}/pets/${id}`);
};

export const getFoundPetById = async (id: string): Promise<AxiosResponse<FoundPetResponse>> => {
  return axios.get<FoundPetResponse>(`${API_URL}/found-pets/${id}`);
};

export const createPet = async (formData: FormData) => {
  return await axios.post(`${API_URL}/pets`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createFoundPet = async (formData: FormData) => {
  return await axios.post(`${API_URL}/found-pets`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const reportFoundFromLost = async (lostPetId: string, formData: FormData) => {
  return await axios.post(`${API_URL}/found-pets/from-lost/${lostPetId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};