import { TransportDebtorsReport, TransportDebtorsFilter } from '../types/transportDebtors';
import { makeApiRequest } from './apiHelper';

export const transportDebtorsService = {
  async getTransportDebtorsReport(filter: TransportDebtorsFilter): Promise<TransportDebtorsReport> {
    const params = new URLSearchParams();
    
    if (filter.year !== undefined) params.append('year', filter.year.toString());
    if (filter.month !== undefined) params.append('month', filter.month.toString());
    if (filter.sedeId !== undefined) params.append('sedeId', filter.sedeId.toString());
    if (filter.nivelEducativoId !== undefined) params.append('nivelEducativoId', filter.nivelEducativoId.toString());
    if (filter.gradoId !== undefined) params.append('gradoId', filter.gradoId.toString());
    if (filter.seccion !== undefined) params.append('seccion', filter.seccion);
    if (filter.rubroId !== undefined) params.append('rubroId', filter.rubroId.toString());
    // Default to true if not specified since this is required by the backend
    params.append('includeCurrentMonth', (filter.includeCurrentMonth ?? true).toString());
    if (filter.minMonthsBehind !== undefined) params.append('minMonthsBehind', filter.minMonthsBehind.toString());
    if (filter.minDebtAmount !== undefined) params.append('minDebtAmount', filter.minDebtAmount.toString());

    const url = `/pagos/transport-debtors-report?${params.toString()}`;
    
    try {
      const response = await makeApiRequest<TransportDebtorsReport>(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching transport debtors report:', error);
      throw error;
    }
  }
};
