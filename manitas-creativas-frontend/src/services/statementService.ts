import { makeApiRequest } from "./apiHelper";
import { PagoReadDto } from "../types/payment";

export const fetchAlumnoStatement = async (
  id: number
): Promise<PagoReadDto[]> => {
  return await makeApiRequest<PagoReadDto[]>(`/alumnos/${id}/statement`, "GET");
};
