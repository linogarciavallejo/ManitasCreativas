using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Http;
using ManitasCreativas.WebApi.Services;

public static class PagoEndpoints
{
    public static void MapPagoEndpoints(this WebApplication app)
    {
        app.MapGet(
            "/pagos",
            async (
                int cicloEscolar,
                int rubroId,
                int gradoId,
                int month,
                IPagoService pagoService,
                IAppLogger appLogger
            ) =>
            {
                try
                {
                    appLogger.LogInformation("Retrieving payments - CicloEscolar: {CicloEscolar}, RubroId: {RubroId}, GradoId: {GradoId}, Month: {Month}", 
                        cicloEscolar, rubroId, gradoId, month);
                    
                    var pagos = await pagoService.GetPagosByCriteriaAsync(
                        cicloEscolar,
                        rubroId,
                        gradoId,
                        month
                    );
                    
                    appLogger.LogInformation("Retrieved {PaymentCount} payments successfully", pagos.Count());
                    return Results.Ok(pagos);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error retrieving payments - CicloEscolar: {CicloEscolar}, RubroId: {RubroId}, GradoId: {GradoId}, Month: {Month}", 
                        cicloEscolar, rubroId, gradoId, month);
                    return Results.Problem("An error occurred while retrieving payments");
                }
            }
        );

        app.MapPost(
            "/pagos",
            async (
                [Microsoft.AspNetCore.Mvc.FromForm] PagoUploadDto pagoDto,
                IPagoService pagoService,
                IAppLogger appLogger
            ) =>
            {
                try
                {
                    appLogger.LogInformation("Creating new payment for Alumno: {AlumnoId}, Monto: {Monto}", 
                        pagoDto.AlumnoId, pagoDto.Monto);
                    
                    var nuevoPago = await pagoService.AddPagoAsync(pagoDto);
                    
                    appLogger.LogPaymentProcessed(nuevoPago.Id.ToString(), pagoDto.AlumnoId.ToString(), pagoDto.Monto);
                    
                    if (pagoDto.ImagenesPago != null && pagoDto.ImagenesPago.Count > 0)
                    {
                        foreach(var image in pagoDto.ImagenesPago)
                        {
                            appLogger.LogFileUploaded(image.FileName, 
                                pagoDto.AlumnoId.ToString(), image.Length);
                        }
                    }
                    
                    return Results.Created($"/pagos/{nuevoPago.Id}", nuevoPago);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error creating payment for Alumno: {AlumnoId}", pagoDto.AlumnoId);
                    return Results.Problem("An error occurred while creating the payment");
                }
            }
        )
        .DisableAntiforgery();

        // New endpoint for payment report
        app.MapGet(
            "/pagos/report",
            async (int cicloEscolar, int gradoId, IPagoService pagoService, IAppLogger appLogger) =>
            {
                try
                {
                    appLogger.LogInformation("Generating payment report - CicloEscolar: {CicloEscolar}, GradoId: {GradoId}", 
                        cicloEscolar, gradoId);
                    
                    var filter = new PagoReportFilterDto
                    {
                        CicloEscolar = cicloEscolar,
                        GradoId = gradoId
                    };
                    var report = await pagoService.GetPagoReportAsync(filter);
                    
                    appLogger.LogInformation("Payment report generated successfully");
                    return Results.Ok(report);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error generating payment report - CicloEscolar: {CicloEscolar}, GradoId: {GradoId}", 
                        cicloEscolar, gradoId);
                    return Results.Problem("An error occurred while generating the payment report");
                }
            }
        );

        // New endpoint for transport payment report
        app.MapGet(
            "/pagos/transport-report",
            async (int cicloEscolar, int rubroId, IPagoService pagoService, IAppLogger appLogger) =>
            {
                try
                {
                    appLogger.LogInformation("Generating transport payment report - CicloEscolar: {CicloEscolar}, RubroId: {RubroId}", 
                        cicloEscolar, rubroId);
                    
                    var filter = new PagoTransporteReportFilterDto
                    {
                        CicloEscolar = cicloEscolar,
                        RubroId = rubroId
                    };
                    var report = await pagoService.GetPagoTransporteReportAsync(filter);
                    
                    appLogger.LogInformation("Transport payment report generated successfully");
                    return Results.Ok(report);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error generating transport payment report - CicloEscolar: {CicloEscolar}, RubroId: {RubroId}", 
                        cicloEscolar, rubroId);
                    return Results.Problem("An error occurred while generating the transport payment report");
                }
            }
        );

        // New endpoint for retrieving payments for editing
        app.MapGet(
            "/pagos/edit",
            async (int cicloEscolar, int? gradoId, int? alumnoId, IPagoService pagoService, IAppLogger appLogger) =>
            {
                try
                {
                    appLogger.LogInformation("Retrieving payments for editing - CicloEscolar: {CicloEscolar}, GradoId: {GradoId}, AlumnoId: {AlumnoId}", 
                        cicloEscolar, gradoId, alumnoId);
                    
                    var pagos = await pagoService.GetPagosForEditAsync(cicloEscolar, gradoId, alumnoId);
                    
                    appLogger.LogInformation("Retrieved {PaymentCount} payments for editing", pagos.Count());
                    return Results.Ok(pagos);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error retrieving payments for editing - CicloEscolar: {CicloEscolar}, GradoId: {GradoId}, AlumnoId: {AlumnoId}", 
                        cicloEscolar, gradoId, alumnoId);
                    return Results.Problem("An error occurred while retrieving payments for editing");
                }
            }
        );

        // Endpoint for updating a payment
        app.MapPut(
            "/pagos/{id}",
            async (
                int id,
                [Microsoft.AspNetCore.Mvc.FromForm] PagoUploadDto pagoDto,
                IPagoService pagoService,
                IAppLogger appLogger
            ) =>
            {
                try
                {
                    appLogger.LogInformation("Updating payment {PaymentId} for Alumno: {AlumnoId}", 
                        id, pagoDto.AlumnoId);
                    
                    var updatedPago = await pagoService.UpdatePagoAsync(id, pagoDto);
                    
                    appLogger.LogUserAction(pagoDto.AlumnoId.ToString(), "Payment Updated", 
                        $"Payment {id} updated with amount {pagoDto.Monto}");
                    
                    return Results.Ok(updatedPago);
                }
                catch (ArgumentException ex)
                {
                    appLogger.LogWarning("Invalid payment update request for payment {PaymentId}: {Message}", 
                        id, ex.Message);
                    return Results.BadRequest(ex.Message);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error updating payment {PaymentId}", id);
                    return Results.Problem("An error occurred while updating the payment");
                }
            }
        )
        .DisableAntiforgery();

        // Endpoint for voiding a payment
        app.MapPost(
            "/pagos/{id}/void",
            async (int id, VoidPagoDto voidDto, IPagoService pagoService, IAppLogger appLogger) =>
            {
                try
                {
                    appLogger.LogInformation("Voiding payment {PaymentId} - Reason: {Reason}, UserId: {UserId}", 
                        id, voidDto.MotivoAnulacion, voidDto.UsuarioAnulacionId);
                    
                    var result = await pagoService.VoidPagoAsync(id, voidDto.MotivoAnulacion, voidDto.UsuarioAnulacionId);
                    
                    appLogger.LogUserAction(voidDto.UsuarioAnulacionId.ToString(), "Payment Voided", 
                        $"Payment {id} voided - Reason: {voidDto.MotivoAnulacion}");
                    
                    return Results.Ok(result);
                }
                catch (ArgumentException ex)
                {
                    appLogger.LogWarning("Invalid void payment request for payment {PaymentId}: {Message}", 
                        id, ex.Message);
                    return Results.BadRequest(ex.Message);
                }
                catch (InvalidOperationException ex)
                {
                    appLogger.LogWarning("Invalid operation when voiding payment {PaymentId}: {Message}", 
                        id, ex.Message);
                    return Results.BadRequest(ex.Message);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error voiding payment {PaymentId}", id);
                    return Results.StatusCode(500);
                }
            }
        );

        // Endpoint for removing a single payment image (soft deletion)
        app.MapDelete(
            "/pagos/images/{imagenId}",
            async (int imagenId, IPagoService pagoService, IAppLogger appLogger) =>
            {
                try
                {
                    appLogger.LogInformation("Removing payment image {ImageId}", imagenId);
                    
                    var result = await pagoService.RemovePagoImagenAsync(imagenId);
                    if (result)
                    {
                        appLogger.LogInformation("Payment image {ImageId} archived successfully", imagenId);
                        return Results.Ok(new { message = "Image archived successfully", imagenId });
                    }
                    else
                    {
                        appLogger.LogWarning("Failed to archive payment image {ImageId}", imagenId);
                        return Results.BadRequest("Failed to archive image");
                    }
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error removing payment image {ImageId}", imagenId);
                    return Results.BadRequest(ex.Message);
                }
            }
        );        
        
        // Endpoint for removing multiple payment images (soft deletion)
        app.MapDelete(
            "/pagos/images",
            async ([Microsoft.AspNetCore.Mvc.FromBody] List<int> imagenesIds, IPagoService pagoService, IAppLogger appLogger) =>
            {
                try
                {
                    appLogger.LogInformation("Removing multiple payment images - Count: {ImageCount}, IDs: {ImageIds}", 
                        imagenesIds?.Count ?? 0, string.Join(", ", imagenesIds ?? new List<int>()));
                    
                    if (imagenesIds == null || !imagenesIds.Any())
                    {
                        appLogger.LogWarning("No image IDs provided for bulk removal");
                        return Results.BadRequest("No image IDs provided");
                    }

                    var result = await pagoService.RemoveMultiplePagoImagenesAsync(imagenesIds);
                    if (result)
                    {
                        appLogger.LogInformation("All {ImageCount} payment images archived successfully", imagenesIds.Count);
                        return Results.Ok(new { message = "All images archived successfully", count = imagenesIds.Count });
                    }
                    else
                    {
                        appLogger.LogWarning("Some payment images failed to archive - Count: {ImageCount}", imagenesIds.Count);
                        return Results.BadRequest("Some images failed to archive");
                    }
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error removing multiple payment images - Count: {ImageCount}", 
                        imagenesIds?.Count ?? 0);
                    return Results.BadRequest(ex.Message);
                }
            }
        );

        // Endpoint for monthly payment report
        app.MapGet(
            "/pagos/monthly-report",
            async (
                int cicloEscolar,
                int month,
                int year,
                int? gradoId,
                string? seccion,
                int? rubroId,
                IPagoService pagoService,
                IAppLogger appLogger
            ) =>
            {
                try
                {
                    appLogger.LogInformation("Generating monthly payment report - Year: {Year}, Month: {Month}, CicloEscolar: {CicloEscolar}, GradoId: {GradoId}, Seccion: {Seccion}, RubroId: {RubroId}", 
                        year, month, cicloEscolar, gradoId, seccion, rubroId);
                    
                    var filter = new MonthlyPaymentReportFilterDto
                    {
                        CicloEscolar = cicloEscolar,
                        Month = month,
                        Year = year,
                        GradoId = gradoId,
                        Seccion = seccion,
                        RubroId = rubroId
                    };
                    
                    var report = await pagoService.GetMonthlyPaymentReportAsync(filter);
                    
                    appLogger.LogInformation("Monthly payment report generated successfully");
                    return Results.Ok(report);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error generating monthly payment report - Year: {Year}, Month: {Month}, CicloEscolar: {CicloEscolar}", 
                        year, month, cicloEscolar);
                    return Results.BadRequest(ex.Message);
                }
            }
        );

        // Tuition debtors report endpoint
        app.MapGet(
            "/pagos/tuition-debtors-report",
            async (
                int? year,
                int? month,
                int? sedeId,
                int? nivelEducativoId,
                int? gradoId,
                string? seccion,
                bool includeCurrentMonth,
                int? minMonthsBehind,
                decimal? minDebtAmount,
                IPagoService pagoService,
                IAppLogger appLogger
            ) =>
            {
                try
                {
                    appLogger.LogInformation("Generating tuition debtors report - Year: {Year}, Month: {Month}, SedeId: {SedeId}, NivelEducativoId: {NivelEducativoId}, GradoId: {GradoId}, MinDebtAmount: {MinDebtAmount}", 
                        year, month, sedeId, nivelEducativoId, gradoId, minDebtAmount);
                    
                    var filter = new TuitionDebtorsFilterDto
                    {
                        Year = year,
                        Month = month,
                        SedeId = sedeId,
                        NivelEducativoId = nivelEducativoId,
                        GradoId = gradoId,
                        Seccion = seccion,
                        IncludeCurrentMonth = includeCurrentMonth,
                        MinMonthsBehind = minMonthsBehind,
                        MinDebtAmount = minDebtAmount
                    };
                    
                    var report = await pagoService.GetTuitionDebtorsReportAsync(filter);
                    
                    appLogger.LogInformation("Tuition debtors report generated successfully");
                    return Results.Ok(report);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error generating tuition debtors report - Year: {Year}, Month: {Month}", 
                        year, month);
                    return Results.BadRequest(ex.Message);
                }
            }
        );        
        
        // Transport debtors report endpoint
        app.MapGet(
            "/pagos/transport-debtors-report",
            async (
                int? year,
                int? month,
                int? sedeId,
                int? nivelEducativoId,
                int? gradoId,
                string? seccion,
                int? rubroId,
                bool? includeCurrentMonth,
                int? minMonthsBehind,
                decimal? minDebtAmount,
                IPagoService pagoService,
                IAppLogger appLogger
            ) =>
            {
                try
                {
                    appLogger.LogInformation("Generating transport debtors report - Year: {Year}, Month: {Month}, SedeId: {SedeId}, RubroId: {RubroId}, MinDebtAmount: {MinDebtAmount}", 
                        year, month, sedeId, rubroId, minDebtAmount);
                    
                    Console.WriteLine($"=== TRANSPORT DEBTORS ENDPOINT CALLED ===");
                    Console.WriteLine($"Parameters received:");
                    Console.WriteLine($"  year: {year}");
                    Console.WriteLine($"  month: {month}");
                    Console.WriteLine($"  sedeId: {sedeId}");
                    Console.WriteLine($"  nivelEducativoId: {nivelEducativoId}");
                    Console.WriteLine($"  gradoId: {gradoId}");
                    Console.WriteLine($"  seccion: {seccion}");
                    Console.WriteLine($"  rubroId: {rubroId}");
                    Console.WriteLine($"  includeCurrentMonth: {includeCurrentMonth}");
                    Console.WriteLine($"  minMonthsBehind: {minMonthsBehind}");
                    Console.WriteLine($"  minDebtAmount: {minDebtAmount}");
                    
                    var filter = new TransportDebtorsFilterDto
                    {
                        Year = year,
                        Month = month,
                        SedeId = sedeId,
                        NivelEducativoId = nivelEducativoId,
                        GradoId = gradoId,
                        Seccion = seccion,
                        RubroId = rubroId,
                        IncludeCurrentMonth = includeCurrentMonth ?? true,
                        MinMonthsBehind = minMonthsBehind,
                        MinDebtAmount = minDebtAmount
                    };
                    
                    var report = await pagoService.GetTransportDebtorsReportAsync(filter);
                    
                    appLogger.LogInformation("Transport debtors report generated successfully");
                    return Results.Ok(report);
                }
                catch (Exception ex)
                {
                    appLogger.LogError(ex, "Error generating transport debtors report - Year: {Year}, Month: {Month}, RubroId: {RubroId}", 
                        year, month, rubroId);
                    return Results.BadRequest(ex.Message);
                }
            }
        );        // Debug endpoint to check route assignments
    }
}

// DTO for void payment request (to be moved to a proper DTO file)
public class VoidPagoDto
{
    public required string MotivoAnulacion { get; set; }
    public int UsuarioAnulacionId { get; set; }
}