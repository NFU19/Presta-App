// types/usuario.ts
// Tipos para el sistema de usuarios

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  matricula: string;
  rol: "Estudiante" | "Docente" | "Administrador"; // RF-1

  // Estado
  activo: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Propiedades del backend (para compatibilidad)
  ID?: number | string;
  Nombre?: string;
  Apellido?: string;
  Email?: string;
  Telefono?: string;
  Matricula?: string;
  Rol?: string;
  Activo?: boolean;
}

export interface RegistroUsuarioData {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  matricula: string;
  rol: "Estudiante" | "Docente" | "Administrador"; // RF-1
}
