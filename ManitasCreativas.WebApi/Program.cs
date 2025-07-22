using Microsoft.EntityFrameworkCore;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Infrastructure;
using ManitasCreativas.Infrastructure.Repositories;
using ManitasCreativas.Infrastructure.Shared.Services;
using Amazon.S3;
using Microsoft.Extensions.Options;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using ManitasCreativas.Application.Services;
using ManitasCreativas.WebApi.Controllers;
using Serilog;
using Serilog.Events;
using Amazon.CloudWatchLogs;
using ManitasCreativas.WebApi.Middleware;
using ManitasCreativas.WebApi.Services;
using Amazon;

// Configure Serilog early in the application startup
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "ManitasCreativas.WebApi")
    .WriteTo.Console(outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting ManitasCreativas Web API");

    var builder = WebApplication.CreateBuilder(args);

    // Configure AWS credentials for CloudWatch logging
    var awsAccessKey = builder.Configuration["AWS:AccessKey"];
    var awsSecretKey = builder.Configuration["AWS:SecretKey"];
    var awsRegion = builder.Configuration["AWS:Region"];

    Log.Information("AWS Configuration - AccessKey: {AccessKey}, Region: {Region}, SecretKey Length: {SecretKeyLength}", 
        awsAccessKey?.Substring(0, Math.Min(8, awsAccessKey?.Length ?? 0)) + "***", 
        awsRegion, 
        awsSecretKey?.Length ?? 0);

    if (!string.IsNullOrEmpty(awsAccessKey) && !string.IsNullOrEmpty(awsSecretKey))
    {
        Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", awsAccessKey);
        Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", awsSecretKey);
        Environment.SetEnvironmentVariable("AWS_REGION", awsRegion);
        Log.Information("AWS credentials set as environment variables");
    }
    else
    {
        Log.Warning("AWS credentials not found in configuration");
    }

    // Replace default logging with Serilog
    builder.Host.UseSerilog((context, services, configuration) =>
    {
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "ManitasCreativas.WebApi");
            
        Log.Information("Serilog configuration loaded, Environment: {Environment}", context.HostingEnvironment.EnvironmentName);
    });

    builder.Services.AddSpaStaticFiles(configuration =>
    {
        configuration.RootPath = "wwwroot";
    });

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Manitas Creativas API";
    config.Version = "v1";
    config.Description = "API documentation for Manitas Creativas";
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", builder =>
    {
        builder.WithOrigins("http://localhost:5173", "http://localhost:5174") // Allow specific origins
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials(); // Enable credentials
    });
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
        // Note: AllowAnyOrigin and AllowCredentials cannot be used together
    });
});

// Register logging service
builder.Services.AddSingleton<IAppLogger, AppLogger>();

// Dependency Injection for Repositories
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IRolRepository, RolRepository>();
builder.Services.AddScoped<IAlumnoRepository, AlumnoRepository>();
builder.Services.AddScoped<IPagoRepository, PagoRepository>();
builder.Services.AddScoped<IPagoImagenRepository, PagoImagenRepository>();
builder.Services.AddScoped<IRubroRepository, RubroRepository>();
builder.Services.AddScoped<INivelEducativoRepository, NivelEducativoRepository>();
builder.Services.AddScoped<IGradoRepository, GradoRepository>();
builder.Services.AddScoped<ISedeRepository, SedeRepository>();
builder.Services.AddScoped<IContactoRepository, ContactoRepository>();
builder.Services.AddScoped<IAlumnoContactoRepository, AlumnoContactoRepository>();
builder.Services.AddScoped<IAlumnoRutaRepository, AlumnoRutaRepository>();

// Uniform Management Repositories
builder.Services.AddScoped<IPrendaUniformeRepository, PrendaUniformeRepository>();
builder.Services.AddScoped<IPrendaUniformeImagenRepository, PrendaUniformeImagenRepository>();
builder.Services.AddScoped<IEntradaUniformeRepository, EntradaUniformeRepository>();
builder.Services.AddScoped<IEntradaUniformeDetalleRepository, EntradaUniformeDetalleRepository>();
builder.Services.AddScoped<IRubroUniformeDetalleRepository, RubroUniformeDetalleRepository>();
builder.Services.AddScoped<IPagoDetalleRepository, PagoDetalleRepository>();

// QR Code Repositories
builder.Services.AddScoped<ICodigosQRPagosRepository, CodigosQRPagosRepository>();

// Dependency Injection for Services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>(sp => {
    var usuarioRepository = sp.GetRequiredService<IUsuarioRepository>();
    var rolRepository = sp.GetRequiredService<IRolRepository>();
    var emailService = sp.GetRequiredService<IEmailService>();
    var configuration = sp.GetRequiredService<IConfiguration>();
    return new UsuarioService(usuarioRepository, rolRepository, emailService, configuration);
});
builder.Services.AddScoped<IRubroService, RubroService>();
builder.Services.AddScoped<INivelEducativoService, NivelEducativoService>();
builder.Services.AddScoped<IGradoService, GradoService>();
builder.Services.AddScoped<ISedeService, SedeService>();
builder.Services.AddScoped<IContactoService, ContactoService>();
builder.Services.AddScoped<IAlumnoRutaService, AlumnoRutaService>();

// Register AlumnoService after its dependencies with all three repositories
builder.Services.AddScoped<IAlumnoService, AlumnoService>(sp => {
    var alumnoRepository = sp.GetRequiredService<IAlumnoRepository>();
    var gradoRepository = sp.GetRequiredService<IGradoRepository>();
    var sedeRepository = sp.GetRequiredService<ISedeRepository>();
    return new AlumnoService(alumnoRepository, gradoRepository, sedeRepository);
});

// Configure AlumnoRutaService with its dependencies
builder.Services.AddScoped<IAlumnoRutaService, AlumnoRutaService>(sp => {
    var alumnoRutaRepository = sp.GetRequiredService<IAlumnoRutaRepository>();
    var alumnoRepository = sp.GetRequiredService<IAlumnoRepository>();
    var rubroRepository = sp.GetRequiredService<IRubroRepository>();
    return new AlumnoRutaService(alumnoRutaRepository, alumnoRepository, rubroRepository);
});

// Fix for CS1643: Ensure all code paths return a value in the lambda expression
builder.Services.AddScoped<IPagoService, PagoService>(sp =>
{
    var pagoRepository = sp.GetRequiredService<IPagoRepository>();
    var s3Service = sp.GetRequiredService<S3Service>();
    var alumnoRepository = sp.GetRequiredService<IAlumnoRepository>();
    var rubroRepository = sp.GetRequiredService<IRubroRepository>();
    var usuarioRepository = sp.GetRequiredService<IUsuarioRepository>();
    var pagoImagenRepository = sp.GetRequiredService<IPagoImagenRepository>();
    var alumnoContactoRepository = sp.GetRequiredService<IAlumnoContactoRepository>();
    var alumnoRutaRepository = sp.GetRequiredService<IAlumnoRutaRepository>();
    var pagoDetalleRepository = sp.GetRequiredService<IPagoDetalleRepository>();

    // Return a new instance of PagoService
    return new PagoService(pagoRepository, s3Service, alumnoRepository, rubroRepository, usuarioRepository, pagoImagenRepository, alumnoContactoRepository, alumnoRutaRepository, pagoDetalleRepository);
});
// Inject S3Service into PagoService
builder.Services.AddScoped<S3Service>();

// Uniform Management Services
builder.Services.AddScoped<IPrendaUniformeService, PrendaUniformeService>();
builder.Services.AddScoped<IEntradaUniformeService, EntradaUniformeService>();
builder.Services.AddScoped<IRubroUniformeDetalleService, RubroUniformeDetalleService>();

// QR Code Services
builder.Services.AddScoped<IQRCodeService, QRCodeService>();

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add S3 configuration
var s3Config = builder.Configuration.GetSection("S3").Get<S3Config>();
if (s3Config != null)
{
    builder.Services.AddSingleton(s3Config);
    builder.Services.AddSingleton<IAmazonS3>(sp =>
    {
        return new AmazonS3Client(s3Config.AccessKey, s3Config.SecretKey, Amazon.RegionEndpoint.GetBySystemName(s3Config.Region));
    });
}

var app = builder.Build();

// Test CloudWatch connectivity immediately after app is built
try
{
    Log.Information("Testing CloudWatch connectivity - App built successfully");
    
    //// Test AWS CloudWatch connection directly
    //var accessKey = builder.Configuration["AWS:AccessKey"];
    //var secretKey = builder.Configuration["AWS:SecretKey"];
    //var region = builder.Configuration["AWS:Region"];
    
    //if (!string.IsNullOrEmpty(accessKey) && !string.IsNullOrEmpty(secretKey))
    //{
    //    Console.WriteLine("🔍 AWS CloudWatch credentials found in configuration");
    //    Console.WriteLine($"   - Access Key: {accessKey?.Substring(0, Math.Min(8, accessKey.Length))}***");
    //    Console.WriteLine($"   - Region: {region}");
    //    Console.WriteLine($"   - Environment: {app.Environment.EnvironmentName}");
        
    //    // Test CloudWatch connection
    //    await CloudWatchTest.TestCloudWatchConnectionAsync(accessKey, secretKey, region);
    //}
    //else
    //{
    //    Console.WriteLine("❌ AWS credentials not found in configuration");
    //}
    
    Log.Warning("This is a test WARNING log for CloudWatch from {Environment}", app.Environment.EnvironmentName);
    Log.Error("This is a test ERROR log for CloudWatch from {Environment}", app.Environment.EnvironmentName);
    Log.Information("Application started in {Environment} mode at {StartTime}", app.Environment.EnvironmentName, DateTime.UtcNow);
    
    Log.Information("CloudWatch test completed, continuing with app startup");
}
catch (Exception ex)
{
    Log.Error(ex, "Error during CloudWatch connectivity test");
}

// Add custom middleware for logging and exception handling
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

// Add Serilog request logging
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
    options.GetLevel = (httpContext, elapsed, ex) =>
    {
        if (ex != null) return LogEventLevel.Error;
        if (httpContext.Response.StatusCode > 499) return LogEventLevel.Error;
        if (httpContext.Response.StatusCode > 399) return LogEventLevel.Warning;
        return LogEventLevel.Information;
    };
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseHttpsRedirection();

// Ensure CORS middleware is applied before mapping endpoints
app.UseCors("AllowSpecificOrigins");
app.UseCors("AllowAllOrigins");

// Map Endpoints
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapAuthEndpoints();
app.MapUsuarioEndpoints();
app.MapAlumnoEndpoints();
app.MapPagoEndpoints();
app.MapRubroEndpoints();
app.MapNivelEducativoEndpoints();
app.MapGradoEndpoints();
app.MapSedeEndpoints();
app.MapContactoEndpoints();
app.MapAlumnoContactoEndpoints();
app.MapAlumnoRutaEndpoints();

// Uniform Management Endpoints
app.MapPrendaUniformeEndpoints();
app.MapEntradaUniformeEndpoints();
app.MapRubroUniformeDetalleEndpoints();

// QR Code Endpoints
app.MapQRCodeEndpoints();

// Health Check Endpoints
app.MapHealthCheckEndpoints();

// Add a startup endpoint to verify the app is running
app.MapGet("/health", () => new { 
    Status = "Healthy", 
    Environment = app.Environment.EnvironmentName,
    Timestamp = DateTime.UtcNow,
    Application = "ManitasCreativas.WebApi"
});

app.MapFallbackToFile("index.html"); // Serve the SPA

Log.Information("ManitasCreativas Web API started successfully in {Environment} mode", app.Environment.EnvironmentName);
app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "ManitasCreativas Web API terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
