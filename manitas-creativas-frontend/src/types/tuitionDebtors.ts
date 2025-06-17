export interface UnpaidTuition {
  year: number;
  month: number;
  monthName: string;
  amount: number;
  dueDate: string;
  daysPastDue: number;
  rubroNombre: string;
}

export interface TuitionDebtor {
  alumnoId: number;
  nombreCompleto: string;
  nivelEducativo: string;
  grado: string;
  seccion: string;
  sede: string;
  unpaidTuitions: UnpaidTuition[];
  totalDebt: number;
  monthsBehind: number;
  lastPaymentDate: string;
  isCurrentMonthOverdue: boolean;
}

export interface TuitionDebtorsSummary {
  currentMonthDelinquent: number;
  oneMonthBehind: number;
  twoMonthsBehind: number;
  threeOrMoreMonthsBehind: number;
  averageDebtPerStudent: number;
  debtorsByGrade: Record<string, number>;
  debtorsBySede: Record<string, number>;
}

export interface TuitionDebtorsReport {
  reportDate: string;
  asOfDate: string;
  totalStudents: number;
  studentsInDebt: number;
  totalDebtAmount: number;
  debtors: TuitionDebtor[];
  summary: TuitionDebtorsSummary;
}

export interface TuitionDebtorsFilter {
  year?: number;
  month?: number;
  sedeId?: number;
  nivelEducativoId?: number;
  gradoId?: number;
  seccion?: string;
  includeCurrentMonth?: boolean;
  minMonthsBehind?: number;
  minDebtAmount?: number;
}
