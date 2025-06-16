# Monthly Payments Report with PivotTable.js

This implementation provides an interactive monthly payments report using PivotTable.js with drill-down capabilities for voided payments.

## Features

### Frontend (React + TypeScript)
- **Interactive PivotTable**: Drag-and-drop interface for dynamic data analysis
- **Multiple Aggregations**: Sum, Count, Average with currency formatting
- **Drill-down Capability**: Click on voided payments to see details
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Filtering**: Filter by school cycle, month/year, grade, section, rubro
- **Summary Statistics**: Quick overview cards with totals and counts

### Backend (.NET Core)
- **Reusable DTOs**: Designed for both web API and future PDF generation
- **Efficient Querying**: Optimized Entity Framework queries with navigation properties
- **Week Calculations**: Automatic week-of-month calculations for grouping
- **Voided Payments Tracking**: Separate categorization for active vs voided payments
- **Audit Information**: Complete user tracking for payment modifications

## API Endpoints

### GET /pagos/monthly-report
Retrieves monthly payment data with optional filters.

**Query Parameters:**
- `cicloEscolar` (required): School cycle year
- `month` (required): Month number (1-12)
- `year` (required): Year
- `gradoId` (optional): Filter by specific grade
- `seccion` (optional): Filter by specific section
- `rubroId` (optional): Filter by specific payment category

**Response:**
```json
{
  "filter": {
    "cicloEscolar": 2025,
    "month": 6,
    "year": 2025
  },
  "summary": {
    "totalAmount": 50000.00,
    "activePaymentsAmount": 48000.00,
    "voidedPaymentsAmount": 2000.00,
    "totalPayments": 150,
    "activePayments": 145,
    "voidedPayments": 5,
    "amountByGrado": {},
    "amountByRubro": {},
    "amountByWeek": {}
  },
  "payments": [
    {
      "id": 1,
      "monto": 500.00,
      "fecha": "2025-06-15T10:30:00Z",
      "alumnoNombre": "Juan Pérez",
      "gradoNombre": "Cuarto Primaria",
      "seccion": "A",
      "rubroDescripcion": "Colegiatura",
      "paymentCategory": "Active",
      "weekRange": "June 15-21, 2025",
      "esAnulado": false
    }
  ],
  "generatedAt": "2025-06-15T14:30:00Z",
  "reportTitle": "Monthly Payments Report",
  "reportPeriod": "June 2025"
}
```

## Installation & Setup

### Backend Dependencies
No additional packages required - uses existing Entity Framework and repository pattern.

### Frontend Dependencies
```bash
cd manitas-creativas-frontend
npm install pivottable jquery @types/jquery
```

### Frontend Usage
```typescript
import MonthlyPaymentReport from '../components/Reports/MonthlyPayments';

// Add to your routing
<Route path="monthly-payments-report" element={<MonthlyPaymentReport />} />
```

## Component Structure

```
src/
├── components/
│   └── Reports/
│       ├── MonthlyPayments/
│       │   ├── MonthlyPaymentReport.tsx
│       │   ├── MonthlyPaymentReport.css
│       │   └── index.ts
│       └── ReportsMenu.tsx
├── services/
│   └── monthlyPaymentReportService.ts
└── types/
    ├── monthlyPaymentReport.ts
    └── pivottable.d.ts
```

## Data Structure

### Key Fields for Analysis
- **Estado**: Active/Anulado (Voided) - for drill-down
- **Grado**: Grade level grouping
- **Sección**: Section within grade
- **Semana**: Week range (e.g., "June 15-21, 2025")
- **Rubro**: Payment category (Tuition, Transport, etc.)
- **Monto**: Payment amount
- **Alumno**: Student name
- **Motivo Anulación**: Void reason (for voided payments)

### Pivot Table Configuration
Default view shows:
- **Rows**: Estado (Active/Voided), Grado
- **Columns**: Semana (Week ranges)
- **Values**: Monto (Sum of amounts)
- **Aggregator**: Sum with currency formatting

## Drill-down Capabilities

### Voided Payments Analysis
1. Set "Estado" as a row field
2. Click on "Anulado" cells to see breakdown
3. Add "Motivo Anulación" and "Usuario Anulación" for details
4. View individual payments with reasons for voiding

### Multi-level Grouping
- **Level 1**: Estado (Active/Voided)
- **Level 2**: Grado (Grade)
- **Level 3**: Sección (Section)
- **Level 4**: Individual payments

## Future Enhancements

### PDF Report Generation (Planned)
The backend DTOs are designed to be reusable for AWS Lambda-based PDF generation:

```csharp
// Future PDF service will reuse these DTOs
public class PdfReportService 
{
    public async Task<byte[]> GenerateMonthlyReportPdf(MonthlyPaymentReportResponseDto data)
    {
        // PDF generation logic using the same data structure
    }
}
```

### Planned Features
- [ ] Automated monthly PDF reports via AWS Lambda
- [ ] Email delivery of reports
- [ ] Scheduled report generation
- [ ] Additional visualization types (charts, graphs)
- [ ] Export to Excel functionality
- [ ] Custom date ranges (not just monthly)

## Performance Considerations

- **Lazy Loading**: Components are loaded only when needed
- **Efficient Queries**: Uses Entity Framework Include() for single-query data retrieval
- **Client-side Filtering**: PivotTable.js handles data manipulation without server round-trips
- **Responsive Design**: CSS optimizations for mobile devices

## Error Handling

- **Backend**: Comprehensive exception handling with descriptive error messages
- **Frontend**: Toast notifications for user feedback
- **Data Validation**: Filter validation before API calls
- **Graceful Degradation**: Handles empty data sets and loading states

## Testing Routes

Access the reports through:
- **Reports Menu**: `/main/reports`
- **Monthly Report**: `/main/monthly-payments-report`

## Notes

1. **Date Handling**: All dates are stored in UTC and converted for display
2. **Currency Formatting**: Uses Guatemalan Quetzal (GTQ) formatting
3. **Week Calculations**: Weeks are calculated relative to month start
4. **Navigation Properties**: Optimized includes for related data (Alumno, Grado, Rubro, etc.)
5. **TypeScript Safety**: Full type definitions for PivotTable.js integration
