using Microsoft.EntityFrameworkCore;
using ManitasCreativas.Application.Interfaces.Services;
using ManitasCreativas.Application.Interfaces.Repositories;
using ManitasCreativas.Infrastructure;
using ManitasCreativas.Infrastructure.Repositories;
using Amazon.S3;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.Extensions.Options;

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

// Add Anti-forgery services
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN"; // Ensure the header name is set correctly
    options.Cookie.Name = ".AspNetCore.Antiforgery"; // Explicitly set the cookie name
    options.Cookie.SameSite = SameSiteMode.None; // Allow cross-origin requests
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // Ensure the cookie is sent over HTTPS
});

// Dependency Injection for Services
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IAlumnoService, AlumnoService>();

// Inject S3Service into PagoService
builder.Services.AddScoped<S3Service>();
builder.Services.AddScoped<IPagoService, PagoService>(sp =>
{
    var pagoRepository = sp.GetRequiredService<IPagoRepository>();
    var s3Service = sp.GetRequiredService<S3Service>();
    return new PagoService(pagoRepository, s3Service);
});

// Dependency Injection for Repositories
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAlumnoRepository, AlumnoRepository>();
builder.Services.AddScoped<IPagoRepository, PagoRepository>();

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

// Add anti-forgery middleware
app.UseAntiforgery();

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/antiforgery-token")
    {
        var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
        var tokens = antiforgery.GetAndStoreTokens(context);
        var cookieName = context.RequestServices.GetRequiredService<IOptions<AntiforgeryOptions>>().Value.Cookie.Name;
        context.Response.Cookies.Append(
            cookieName,
            tokens.RequestToken,
            new CookieOptions
            {
                HttpOnly = true, // Ensure the cookie is HTTP-only
                Secure = true, // Ensure the cookie is sent over HTTPS
                SameSite = SameSiteMode.None // Allow cross-origin requests
            });
    }
    await next();
});
// Ensure CORS middleware is applied before mapping endpoints
app.UseCors("AllowSpecificOrigins");


// Map Endpoints
app.MapUsuarioEndpoints();
app.MapAlumnoEndpoints();
app.MapPagoEndpoints();

app.Run();
