export interface UnpaidTransport {
  year: number;
  month: number;
  monthName: string;
  amount: number;
  dueDate: string;
  daysPastDue: number;
  rubroNombre: string;
}

export interface TransportDebtor {
  alumnoId: number;
  nombreCompleto: string;
  nivelEducativo: string;
  grado: string;
  seccion: string;
  sede: string;
  rubroTransporte: string;
  unpaidTransports: UnpaidTransport[];
  totalDebt: number;
  monthsBehind: number;
  lastPaymentDate: string;
  isCurrentMonthOverdue: boolean;
}

export interface TransportDebtorsSummary {
  currentMonthDelinquent: number;
  oneMonthBehind: number;
  twoMonthsBehind: number;
  threeOrMoreMonthsBehind: number;
  averageDebtPerStudent: number;
  debtorsByGrade: Record<string, number>;
  debtorsBySede: Record<string, number>;
  debtorsByRoute: Record<string, number>;
}

export interface TransportDebtorsReport {
  reportDate: string;
  asOfDate: string;
  totalStudents: number;
  studentsInDebt: number;
  totalDebtAmount: number;
  debtors: TransportDebtor[];
  summary: TransportDebtorsSummary;
}

export interface TransportDebtorsFilter {
  year?: number;
  month?: number;
  sedeId?: number;
  nivelEducativoId?: number;
  gradoId?: number;
  seccion?: string;
  rubroId?: number; // Transport route filter
  includeCurrentMonth?: boolean;
  minMonthsBehind?: number;
  minDebtAmount?: number;
}
