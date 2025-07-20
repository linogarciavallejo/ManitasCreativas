// QR Code service for API interactions
import { makeApiRequest } from './apiHelper';

export interface QRCodeGenerateRequest {
  pagoId: number;
  expirationMinutes?: number; // Optional, defaults to 1 year on backend
}

export interface QRCodeGenerateResponse {
  tokenUnico: string;
  qrCodeImageBase64: string;
  fechaExpiracion: string;
  pagoId: number;
  pagoInfo: string;
}

export interface QRCodeValidateRequest {
  token: string;
}

export interface QRCodeValidateResponse {
  isValid: boolean;
  message: string;
  pagoId?: number;
  alumnoNombre?: string;
  rubroDescripcion?: string;
  montosPago?: number;
  fechaPago?: string;
}

export const qrCodeService = {
  /**
   * Generate a QR code for a payment
   */
  generateQRCode: async (request: QRCodeGenerateRequest): Promise<QRCodeGenerateResponse> => {
    console.log('[qrCodeService] generateQRCode called with request:', request);
    try {
      const response = await makeApiRequest<QRCodeGenerateResponse>('/api/qrcode/generate', 'POST', request);
      console.log('[qrCodeService] generateQRCode response:', response);
      return response;
    } catch (error) {
      console.error('[qrCodeService] generateQRCode error:', error);
      throw error;
    }
  },

  /**
   * Validate a QR code
   */
  validateQRCode: async (request: QRCodeValidateRequest): Promise<QRCodeValidateResponse> => {
    console.log('[qrCodeService] validateQRCode called with request:', request);
    try {
      const response = await makeApiRequest<QRCodeValidateResponse>('/api/qrcode/validate', 'POST', request);
      console.log('[qrCodeService] validateQRCode response:', response);
      return response;
    } catch (error) {
      console.error('[qrCodeService] validateQRCode error:', error);
      throw error;
    }
  },

  /**
   * Get QR code for a specific payment (if exists)
   */
  getQRCodeForPayment: async (pagoId: number): Promise<QRCodeGenerateResponse | null> => {
    console.log(`[qrCodeService] getQRCodeForPayment called with pagoId: ${pagoId}`);
    try {
      const response = await makeApiRequest<QRCodeGenerateResponse>(`/api/qrcode/payment/${pagoId}`, 'GET');
      console.log('[qrCodeService] getQRCodeForPayment response:', response);
      return response;
    } catch (error: unknown) {
      console.log('[qrCodeService] getQRCodeForPayment error:', error);
      const axiosError = error as { response?: { status: number } };
      if (axiosError.response?.status === 404) {
        console.log(`[qrCodeService] No QR code found for payment ${pagoId} (404)`);
        return null; // No QR code exists for this payment
      }
      console.error(`[qrCodeService] Unexpected error getting QR code for payment ${pagoId}:`, error);
      throw error;
    }
  }
};
