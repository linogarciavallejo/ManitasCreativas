// Types for Monthly Payment Report
export interface MonthlyPaymentReportFilter {
  cicloEscolar: number;
  month: number;
  year: number;
  gradoId?: number;
  seccion?: string;
  rubroId?: number;
}

export interface MonthlyPaymentItem {
  id: number;
  monto: number;
  fecha: string;
  cicloEscolar: number;
  medioPago: string;
  rubroDescripcion: string;
  tipoRubro: string;
  esColegiatura: boolean;
  mesColegiatura?: number;
  anioColegiatura?: number;
  notas: string;
  
  // Student information
  alumnoId: number;
  alumnoNombre: string;
  gradoNombre: string;
  seccion: string;
  nivelEducativo: string;
  
  // Payment status
  esAnulado: boolean;
  motivoAnulacion?: string;
  fechaAnulacion?: string;
  usuarioAnulacionNombre: string;
  
  // Week information for grouping
  weekOfMonth: number;
  weekRange: string;
  
  // Day information
  dayOfWeek: string;
  dayOfMonth: number;
  
  // Payment type categorization
  paymentCategory: string; // "Active" or "Voided"
}

export interface MonthlyPaymentSummary {
  totalAmount: number;
  activePaymentsAmount: number;
  voidedPaymentsAmount: number;
  totalPayments: number;
  activePayments: number;
  voidedPayments: number;
  amountByGrado: Record<string, number>;
  amountByRubro: Record<string, number>;
  amountByWeek: Record<string, number>;
  paymentCountByGrado: Record<string, number>;
  paymentCountByRubro: Record<string, number>;
  paymentCountByWeek: Record<string, number>;
}

export interface MonthlyPaymentReportResponse {
  filter: MonthlyPaymentReportFilter;
  summary: MonthlyPaymentSummary;
  payments: MonthlyPaymentItem[];
  generatedAt: string;
  reportTitle: string;
  reportPeriod: string;
}

// PivotTable configuration types
export interface PivotTableConfig {
  rows: string[];
  cols: string[];
  aggregatorName: string;
  vals: string[];
  rowOrder: string;
  colOrder: string;
  rendererName: string;
}
