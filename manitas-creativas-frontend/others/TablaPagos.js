function TablaPagos({ rubros, alumnos }) {
  const mesesOrden = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const rubrosOrdenados = rubros.sort((a, b) => a.ordenVisualizacion - b.ordenVisualizacion);

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pagado": return "✔️";
      case "pendiente": return "⚠️";
      case "atrasado": return "❌";
      default: return "";
    }
  };

  return (
    <table border={1}>
      <thead>
        <tr>
          <th rowSpan={2}>Alumno</th>
          {rubrosOrdenados.map(rubro => (
            rubro.EsColegiatura
              ? <th key={rubro.id} colSpan={mesesOrden.length}>{rubro.descripcion}</th>
              : <th rowSpan={2} key={rubro.id}>{rubro.descripcion}</th>
          ))}
        </tr>
        <tr>
          {rubrosOrdenados.some(r => r.EsColegiatura) && 
            mesesOrden.map(mes => <th key={mes}>{mes}</th>)}
        </tr>
      </thead>
      <tbody>
        {alumnos.map(alumno => (
          <tr key={alumno.alumnoId}>
            <td>{alumno.nombre}</td>
            {rubrosOrdenados.map(rubro => {
              if (!rubro.EsColegiatura) {
                const pago = alumno.pagos.find(p => p.rubroId === rubro.id);
                return (
                  <td key={rubro.id}>
                    {pago ? `Q${pago.monto.toFixed(2)} ${getEstadoIcon(pago.estado)}` : "—"}
                  </td>
                );
              } else {
                return mesesOrden.map(mes => {
                  const pagoMes = alumno.pagos.find(p => p.rubroId === rubro.id && p.mesColegiatura === mes);
                  return (
                    <td key={`${rubro.id}-${mes}`}>
                      {pagoMes ? `Q${pagoMes.monto.toFixed(2)} ${getEstadoIcon(pagoMes.estado)}` : "—"}
                    </td>
                  );
                });
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
