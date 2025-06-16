import axios from 'axios';
import { MonthlyPaymentReportFilter, MonthlyPaymentReportResponse } from '../types/monthlyPaymentReport';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7144';

export class MonthlyPaymentReportService {
  static async getMonthlyPaymentReport(filter: MonthlyPaymentReportFilter): Promise<MonthlyPaymentReportResponse> {
    try {
      const params = new URLSearchParams();
      params.append('cicloEscolar', filter.cicloEscolar.toString());
      params.append('month', filter.month.toString());
      params.append('year', filter.year.toString());
      
      if (filter.gradoId) {
        params.append('gradoId', filter.gradoId.toString());
      }
      
      if (filter.seccion) {
        params.append('seccion', filter.seccion);
      }
      
      if (filter.rubroId) {
        params.append('rubroId', filter.rubroId.toString());
      }

      const response = await axios.get(`${API_BASE_URL}/pagos/monthly-report?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly payment report:', error);
      throw error;
    }
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1] || 'Unknown';
  }
}
