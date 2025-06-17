import { TuitionDebtorsReport, TuitionDebtorsFilter } from '../types/tuitionDebtors';
import { makeApiRequest } from './apiHelper';

export const tuitionDebtorsService = {  async getTuitionDebtorsReport(filter: TuitionDebtorsFilter): Promise<TuitionDebtorsReport> {
    const params = new URLSearchParams();
    
    if (filter.year !== undefined) params.append('year', filter.year.toString());
    if (filter.month !== undefined) params.append('month', filter.month.toString());
    if (filter.sedeId !== undefined) params.append('sedeId', filter.sedeId.toString());
    if (filter.nivelEducativoId !== undefined) params.append('nivelEducativoId', filter.nivelEducativoId.toString());
    if (filter.gradoId !== undefined) params.append('gradoId', filter.gradoId.toString());
    if (filter.seccion !== undefined) params.append('seccion', filter.seccion);
    // Default to true if not specified since this is required by the backend
    params.append('includeCurrentMonth', (filter.includeCurrentMonth ?? true).toString());
    if (filter.minMonthsBehind !== undefined) params.append('minMonthsBehind', filter.minMonthsBehind.toString());
    if (filter.minDebtAmount !== undefined) params.append('minDebtAmount', filter.minDebtAmount.toString());

    const url = `/pagos/tuition-debtors-report?${params.toString()}`;
      try {
      const response = await makeApiRequest<TuitionDebtorsReport>(url, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching tuition debtors report:', error);
      throw error;
    }
  }
};
