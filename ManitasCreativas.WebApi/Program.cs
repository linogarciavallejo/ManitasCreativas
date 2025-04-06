using Microsoft.EntityFrameworkCore;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Infrastructure;
using ManitasCreativas.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

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
});

// Dependency Injection for Services
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAlumnoService, AlumnoService>();
builder.Services.AddScoped<IPagoService, PagoService>();

// Dependency Injection for Repositories
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAlumnoRepository, AlumnoRepository>();
builder.Services.AddScoped<IPagoRepository, PagoRepository>();

// Add DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Map Endpoints
app.MapUsuarioEndpoints();
app.MapAlumnoEndpoints();
app.MapPagoEndpoints();

app.Run();
