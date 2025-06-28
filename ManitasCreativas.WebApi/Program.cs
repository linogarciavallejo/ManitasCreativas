using Microsoft.EntityFrameworkCore;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Infrastructure;
using ManitasCreativas.Infrastructure.Repositories;
using Amazon.S3;
using Microsoft.Extensions.Options;
using ManitasCreativas.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using ManitasCreativas.Application.Services;
using ManitasCreativas.WebApi.Controllers;

var builder = WebApplication.CreateBuilder(args);

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
        builder.WithOrigins("http://localhost:5173") // Allow specific origin
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

// Dependency Injection for Services
builder.Services.AddScoped<IUsuarioService, UsuarioService>(sp => {
    var usuarioRepository = sp.GetRequiredService<IUsuarioRepository>();
    var rolRepository = sp.GetRequiredService<IRolRepository>();
    return new UsuarioService(usuarioRepository, rolRepository);
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

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add S3 configuration
var s3Config = builder.Configuration.GetSection("S3").Get<S3Config>();
builder.Services.AddSingleton(s3Config);
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    return new AmazonS3Client(s3Config.AccessKey, s3Config.SecretKey, Amazon.RegionEndpoint.GetBySystemName(s3Config.Region));
});

var app = builder.Build();

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

app.MapFallbackToFile("index.html"); // Serve the SPA

app.Run();
