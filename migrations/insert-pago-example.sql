-- INSERT statement corresponding to the SELECT query:
-- SELECT * FROM public."Pagos" WHERE "RubroId" = 8 AND "AlumnoId" = 7 ORDER BY "Id" ASC

INSERT INTO public."Pagos" (
    "CicloEscolar", 
    "Fecha", 
    "Monto", 
    "MedioPago", 
    "Notas", 
    "AlumnoId", 
    "RubroId", 
    "EsColegiatura", 
    "MesColegiatura", 
    "AnioColegiatura", 
    "EsPagoDeCarnet", 
    "EstadoCarnet", 
    "EsPagoDeTransporte", 
    "EsPagoDeUniforme", 
    "FechaCreacion", 
    "UsuarioCreacionId", 
    "EsAnulado"
) VALUES (
    2025,                           -- CicloEscolar (example: current school year)
    CURRENT_TIMESTAMP,              -- Fecha (current timestamp)
    100.00,                         -- Monto (example amount)
    0,                              -- MedioPago (0 = Efectivo, 1 = Transferencia, etc.)
    'Pago de ejemplo',              -- Notas (optional notes)
    7,                              -- AlumnoId (matches the WHERE clause)
    8,                              -- RubroId (matches the WHERE clause)
    true,                           -- EsColegiatura (if it's a tuition payment)
    EXTRACT(MONTH FROM CURRENT_DATE), -- MesColegiatura (current month)
    EXTRACT(YEAR FROM CURRENT_DATE),  -- AnioColegiatura (current year)
    false,                          -- EsPagoDeCarnet
    '',                             -- EstadoCarnet
    false,                          -- EsPagoDeTransporte
    false,                          -- EsPagoDeUniforme
    CURRENT_TIMESTAMP,              -- FechaCreacion
    1,                              -- UsuarioCreacionId (replace with actual user ID)
    false                           -- EsAnulado
);
