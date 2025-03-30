export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  direccion: string;
  contrasena?: string;
  rol: string;
  estado: boolean;
}
