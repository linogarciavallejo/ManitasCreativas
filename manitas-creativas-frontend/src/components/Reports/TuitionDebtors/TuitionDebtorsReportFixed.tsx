import React, { useState, useEffect, useCallback } from 'react';
import { 
  type TuitionDebtorsReport as TuitionDebtorsReportType, 
  TuitionDebtorsFilter,
  TuitionDebtor 
} from '../../../types/tuitionDebtors';
import { tuitionDebtorsService } from '../../../services/tuitionDebtorsService';
import { sedeService, type Sede } from '../../../services/sedeService';
import { nivelEducativoService, type NivelEducativo } from '../../../services/nivelEducativoService';
import { gradoService, type Grado } from '../../../services/gradoService';
import './TuitionDebtorsReport.css';

interface ExpandedDebtor {
  [key: number]: boolean;
}

const TuitionDebtorsReport: React.FC = () => {
  const [reportData, setReportData] = useState<TuitionDebtorsReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDebtors, setExpandedDebtors] = useState<ExpandedDebtor>({});
  
  // Filter state
  const [filter, setFilter] = useState<TuitionDebtorsFilter>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    includeCurrentMonth: true
  });

  // Dropdown data
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [nivelesEducativos, setNivelesEducativos] = useState<NivelEducativo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [secciones] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);

  const loadDropdownData = async () => {
    try {
      const [sedesData, nivelesData, gradosData] = await Promise.all([
        sedeService.getAllSedes(),
        nivelEducativoService.getActiveNivelesEducativos(),
        gradoService.getAllGrados()
      ]);
      setSedes(sedesData);
      setNivelesEducativos(nivelesData);
      setGrados(gradosData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tuitionDebtorsService.getTuitionDebtorsReport(filter);
      setReportData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching report');
      console.error('Error fetching tuition debtors report:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFilterChange = (field: keyof TuitionDebtorsFilter, value: string | number | boolean | undefined) => {
    setFilter(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const toggleDebtorExpansion = (debtorId: number) => {
    setExpandedDebtors(prev => ({
      ...prev,
      [debtorId]: !prev[debtorId]
    }));
  };

  const formatCurrency = (amount: number) => {
    return `Q${amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT');
  };

  const getDelinquencyLabel = (monthsBehind: number, isCurrentOverdue: boolean) => {
    if (isCurrentOverdue && monthsBehind === 1) return 'Mes Actual Vencido';
    if (monthsBehind === 1) return '1 Mes Atrasado';
    if (monthsBehind === 2) return '2 Meses Atrasados';
    if (monthsBehind >= 3) return `${monthsBehind} Meses Atrasados`;
    return 'Al Día';
  };

  const getDelinquencyClass = (monthsBehind: number, isCurrentOverdue: boolean) => {
    if (isCurrentOverdue || monthsBehind === 1) return 'delinquency-warning';
    if (monthsBehind === 2) return 'delinquency-danger';
    if (monthsBehind >= 3) return 'delinquency-critical';
    return '';
  };

  if (loading) {
    return (
      <div className="tuition-debtors-report">
        <div className="loading">
          <p>Cargando reporte de morosos de colegiatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tuition-debtors-report">
      <h1>Reporte de Morosos de Colegiatura</h1>
      
      {/* Filters */}
      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Año:</label>
            <select
              value={filter.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Mes:</label>
            <select
              value={filter.month || ''}
              onChange={(e) => handleFilterChange('month', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              <option value={1}>Enero</option>
              <option value={2}>Febrero</option>
              <option value={3}>Marzo</option>
              <option value={4}>Abril</option>
              <option value={5}>Mayo</option>
              <option value={6}>Junio</option>
              <option value={7}>Julio</option>
              <option value={8}>Agosto</option>
              <option value={9}>Septiembre</option>
              <option value={10}>Octubre</option>
              <option value={11}>Noviembre</option>
              <option value={12}>Diciembre</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sede:</label>
            <select
              value={filter.sedeId || ''}
              onChange={(e) => handleFilterChange('sedeId', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todas</option>
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>{sede.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Nivel Educativo:</label>
            <select
              value={filter.nivelEducativoId || ''}
              onChange={(e) => handleFilterChange('nivelEducativoId', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              {nivelesEducativos.map(nivel => (
                <option key={nivel.id} value={nivel.id}>{nivel.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Grado:</label>
            <select
              value={filter.gradoId || ''}
              onChange={(e) => handleFilterChange('gradoId', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              {grados.map(grado => (
                <option key={grado.id} value={grado.id}>{grado.nombre}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sección:</label>
            <select
              value={filter.seccion || ''}
              onChange={(e) => handleFilterChange('seccion', e.target.value || undefined)}
            >
              <option value="">Todas</option>
              {secciones.map(seccion => (
                <option key={seccion} value={seccion}>{seccion}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Mínimo Meses Atrasados:</label>
            <select
              value={filter.minMonthsBehind || ''}
              onChange={(e) => handleFilterChange('minMonthsBehind', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todos</option>
              <option value={1}>1 mes</option>
              <option value={2}>2 meses</option>
              <option value={3}>3 meses</option>
              <option value={4}>4+ meses</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Deuda Mínima:</label>
            <input
              type="number"
              value={filter.minDebtAmount || ''}
              onChange={(e) => handleFilterChange('minDebtAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Q0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={fetchReport} className="btn-primary">
            Generar Reporte
          </button>
          <button 
            onClick={() => setFilter({ year: new Date().getFullYear(), month: new Date().getMonth() + 1, includeCurrentMonth: true })}
            className="btn-secondary"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="summary-section">
            <h3>Resumen</h3>
            <div className="summary-cards">
              <div className="summary-card">
                <h4>Total Estudiantes</h4>
                <p className="summary-number">{reportData.totalStudents}</p>
              </div>
              <div className="summary-card warning">
                <h4>Estudiantes en Mora</h4>
                <p className="summary-number">{reportData.studentsInDebt}</p>
              </div>
              <div className="summary-card danger">
                <h4>Deuda Total</h4>
                <p className="summary-number">{formatCurrency(reportData.totalDebtAmount)}</p>
              </div>
              <div className="summary-card">
                <h4>Promedio por Estudiante</h4>
                <p className="summary-number">{formatCurrency(reportData.summary.averageDebtPerStudent)}</p>
              </div>
            </div>

            <div className="breakdown-cards">
              <div className="breakdown-card">
                <h4>Mes Actual Vencido</h4>
                <p>{reportData.summary.currentMonthDelinquent}</p>
              </div>
              <div className="breakdown-card">
                <h4>1 Mes Atrasado</h4>
                <p>{reportData.summary.oneMonthBehind}</p>
              </div>
              <div className="breakdown-card">
                <h4>2 Meses Atrasados</h4>
                <p>{reportData.summary.twoMonthsBehind}</p>
              </div>
              <div className="breakdown-card">
                <h4>3+ Meses Atrasados</h4>
                <p>{reportData.summary.threeOrMoreMonthsBehind}</p>
              </div>
            </div>
          </div>

          {/* Debtors Table */}
          <div className="debtors-section">
            <h3>Estudiantes en Mora ({reportData.debtors.length})</h3>
            <div className="debtors-table">
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Grado/Sección</th>
                    <th>Sede</th>
                    <th>Meses Atrasados</th>
                    <th>Deuda Total</th>
                    <th>Estado</th>
                    <th>Último Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.debtors.map((debtor: TuitionDebtor) => (
                    <React.Fragment key={debtor.alumnoId}>
                      <tr className={getDelinquencyClass(debtor.monthsBehind, debtor.isCurrentMonthOverdue)}>
                        <td>{debtor.nombreCompleto}</td>
                        <td>{debtor.grado} - {debtor.seccion}</td>
                        <td>{debtor.sede}</td>
                        <td>{debtor.monthsBehind}</td>
                        <td>{formatCurrency(debtor.totalDebt)}</td>
                        <td>
                          <span className={`status-badge ${getDelinquencyClass(debtor.monthsBehind, debtor.isCurrentMonthOverdue)}`}>
                            {getDelinquencyLabel(debtor.monthsBehind, debtor.isCurrentMonthOverdue)}
                          </span>
                        </td>
                        <td>
                          {debtor.lastPaymentDate !== '0001-01-01T00:00:00' 
                            ? formatDate(debtor.lastPaymentDate) 
                            : 'Sin pagos'}
                        </td>
                        <td>
                          <button
                            onClick={() => toggleDebtorExpansion(debtor.alumnoId)}
                            className="btn-expand"
                          >
                            {expandedDebtors[debtor.alumnoId] ? '▼' : '▶'} Detalle
                          </button>
                        </td>
                      </tr>
                      {expandedDebtors[debtor.alumnoId] && (
                        <tr>
                          <td colSpan={8}>
                            <div className="debtor-details">
                              <h5>Colegiaturas Pendientes:</h5>
                              <table className="unpaid-tuitions-table">
                                <thead>
                                  <tr>
                                    <th>Mes</th>
                                    <th>Rubro</th>
                                    <th>Monto</th>
                                    <th>Fecha Vencimiento</th>
                                    <th>Días Vencidos</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {debtor.unpaidTuitions.map((tuition, index) => (
                                    <tr key={index}>
                                      <td>{tuition.monthName} {tuition.year}</td>
                                      <td>{tuition.rubroNombre}</td>
                                      <td>{formatCurrency(tuition.amount)}</td>
                                      <td>{formatDate(tuition.dueDate)}</td>
                                      <td className={tuition.daysPastDue > 0 ? 'days-overdue' : ''}>
                                        {tuition.daysPastDue} días
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TuitionDebtorsReport;
