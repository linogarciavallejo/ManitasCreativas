import React, { useState, useEffect, useCallback } from 'react';
import { 
  type TransportDebtorsReport as TransportDebtorsReportType, 
  TransportDebtorsFilter,
  TransportDebtor 
} from '../../../types/transportDebtors';
import { transportDebtorsService } from '../../../services/transportDebtorsService';
import { sedeService, type Sede } from '../../../services/sedeService';
import { nivelEducativoService, type NivelEducativo } from '../../../services/nivelEducativoService';
import { gradoService, type Grado } from '../../../services/gradoService';
import { rubroService, type Rubro } from '../../../services/rubroService';
import './TransportDebtorsReport.css';

interface ExpandedDebtor {
  [key: number]: boolean;
}

const TransportDebtorsReport: React.FC = () => {
  const [reportData, setReportData] = useState<TransportDebtorsReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDebtors, setExpandedDebtors] = useState<ExpandedDebtor>({});
  
  // Filter state
  const [filter, setFilter] = useState<TransportDebtorsFilter>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    includeCurrentMonth: true
  });

  // Dropdown data
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [nivelesEducativos, setNivelesEducativos] = useState<NivelEducativo[]>([]);
  const [grados, setGrados] = useState<Grado[]>([]);
  const [transportRubros, setTransportRubros] = useState<Rubro[]>([]);
  const [secciones] = useState<string[]>(['A', 'B', 'C', 'D', 'E']);

  const loadDropdownData = async () => {
    try {
      const [sedesData, nivelesData, gradosData, rubrosData] = await Promise.all([
        sedeService.getAllSedes(),
        nivelEducativoService.getActiveNivelesEducativos(),
        gradoService.getAllGrados(),
        rubroService.getAllRubros()
      ]);
      setSedes(sedesData);
      setNivelesEducativos(nivelesData);
      setGrados(gradosData);
      // Filter to only transport rubros
      setTransportRubros(rubrosData.filter(r => r.esPagoDeTransporte));
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const fetchReport = useCallback(async () => {
    console.log('=== Frontend Component fetchReport ===');
    console.log('Current filter state:', filter);
    
    setLoading(true);
    setError(null);
    try {
      const data = await transportDebtorsService.getTransportDebtorsReport(filter);
      setReportData(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error fetching report');
      console.error('Error fetching transport debtors report:', error);
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

  const handleFilterChange = (field: keyof TransportDebtorsFilter, value: string | number | boolean | undefined) => {
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

  const getRowClass = (monthsBehind: number) => {
    if (monthsBehind >= 2) return 'high-delinquency-row';
    return '';
  };

  const getGradoSeccionHeader = () => {
    if (filter.gradoId) {
      return 'Sección';
    }
    return 'Grado/Sección';
  };

  const getGradoSeccionValue = (debtor: TransportDebtor) => {
    if (filter.gradoId) {
      return debtor.seccion;
    }
    return `${debtor.grado} - ${debtor.seccion}`;
  };

  const getRubroHeader = () => {
    if (filter.rubroId) {
      return 'Ruta';
    }
    return 'Ruta de Transporte';
  };

  const getRubroValue = (debtor: TransportDebtor) => {
    return debtor.rubroTransporte;
  };

  if (loading) {
    return (
      <div className="transport-debtors-report">
        <div className="loading">
          <p>Cargando reporte de morosos de transporte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transport-debtors-report">
      <h1>Reporte de Morosos de Transporte</h1>
      
      {/* Filters */}
      <div className="filters-section">
        <h3>Filtros</h3>
        
        {/* Info note about route assignments */}
        <div style={{ 
          background: '#e6f7ff', 
          border: '1px solid #91d5ff', 
          borderRadius: '4px', 
          padding: '12px', 
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <strong>📋 Nota:</strong> Este reporte solo incluye estudiantes que tienen asignaciones de rutas de transporte activas. 
          Los estudiantes sin rutas asignadas no aparecerán en el reporte, incluso si tienen pagos pendientes de transporte. 
          Utilice el módulo de "Asignación de Rutas" para asignar estudiantes a rutas específicas.
        </div>

        {/* Debug filter display */}
        <div style={{ 
          background: '#f0f0f0', 
          border: '1px solid #ccc', 
          borderRadius: '4px', 
          padding: '8px', 
          marginBottom: '16px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>🔍 Filtros aplicados:</strong><br/>
          Año: {filter.year || 'Todos'} | 
          Mes: {filter.month || 'Todos'} | 
          Sede: {filter.sedeId || 'Todas'} | 
          Ruta: {filter.rubroId ? `${filter.rubroId} (${transportRubros.find(r => r.id === filter.rubroId)?.descripcion || 'No encontrada'})` : 'Todas'}
        </div>
        
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
          </div>          <div className="filter-group filter-group-route">
            <label>Ruta de Transporte:</label>
            <select
              className="route-select"
              value={filter.rubroId || ''}
              onChange={(e) => handleFilterChange('rubroId', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Todas</option>
              {transportRubros.map(rubro => (
                <option key={rubro.id} value={rubro.id}>{rubro.descripcion}</option>
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
            <div className="summary-cards">              <div className="summary-card">
                <h4>Total Estudiantes</h4>
                <p className="summary-number">{reportData.totalStudents}</p>
                <small>Con rutas asignadas</small>
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
            </div>            <div className="breakdown-cards">
              <div className="breakdown-card">
                <h4>Deudores por Ruta</h4>
                <div style={{ fontSize: '12px' }}>
                  {reportData.summary.debtorsByRoute && Object.entries(reportData.summary.debtorsByRoute).map(([route, count]) => (
                    <div key={route} style={{ margin: '4px 0' }}>
                      <strong>{route}:</strong> {count} estudiantes
                    </div>
                  ))}
                </div>
              </div>
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

          {/* Debtors Table */}          <div className="debtors-section">
            <h3>Estudiantes en Mora - Solo Rutas Asignadas ({reportData.debtors.length})</h3>
            
            {/* Filter status message */}
            {filter.rubroId ? (
              <div style={{ 
                background: '#fff2e6', 
                border: '1px solid #ffb366', 
                borderRadius: '4px', 
                padding: '8px', 
                marginBottom: '12px',
                fontSize: '14px'
              }}>
                🚍 <strong>Filtro de ruta aplicado:</strong> Solo mostrando estudiantes asignados a la ruta 
                "{transportRubros.find(r => r.id === filter.rubroId)?.descripcion || `ID ${filter.rubroId}`}"
              </div>
            ) : (
              <div style={{ 
                background: '#f6fff2', 
                border: '1px solid #73d13d', 
                borderRadius: '4px', 
                padding: '8px', 
                marginBottom: '12px',
                fontSize: '14px'
              }}>
                🚍 <strong>Todas las rutas:</strong> Mostrando estudiantes de todas las rutas de transporte asignadas
              </div>
            )}

            <div className="debtors-table">
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>{getGradoSeccionHeader()}</th>
                    <th>{getRubroHeader()}</th>
                    <th>Meses Atrasados</th>
                    <th>Deuda Total</th>
                    <th>Estado</th>
                    <th>Último Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.debtors.map((debtor: TransportDebtor) => (
                    <React.Fragment key={debtor.alumnoId}>
                      <tr className={`${getDelinquencyClass(debtor.monthsBehind, debtor.isCurrentMonthOverdue)} ${getRowClass(debtor.monthsBehind)}`}>
                        <td>{debtor.nombreCompleto}</td>
                        <td>{getGradoSeccionValue(debtor)}</td>
                        <td>{getRubroValue(debtor)}</td>
                        <td>
                          {debtor.monthsBehind >= 2 && <span className="red-flag">🚩 </span>}
                          {debtor.monthsBehind}
                        </td>
                        <td className="currency-value">{formatCurrency(debtor.totalDebt)}</td>
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
                              <h5>Pagos de Transporte Pendientes:</h5>
                              <table className="unpaid-transports-table">
                                <thead>
                                  <tr>
                                    <th>Mes</th>
                                    <th>Ruta</th>
                                    <th>Monto</th>
                                    <th>Fecha Vencimiento</th>
                                    <th>Días Vencidos</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {debtor.unpaidTransports.map((transport, index) => (
                                    <tr key={index}>
                                      <td>{transport.monthName} {transport.year}</td>
                                      <td>{transport.rubroNombre}</td>
                                      <td>{formatCurrency(transport.amount)}</td>
                                      <td>{formatDate(transport.dueDate)}</td>
                                      <td className={transport.daysPastDue > 0 ? 'days-overdue' : ''}>
                                        {transport.daysPastDue} días
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

export default TransportDebtorsReport;
