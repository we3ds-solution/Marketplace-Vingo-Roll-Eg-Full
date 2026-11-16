using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Vingo.Infrastructure.Persistence;
using Vingo.Infrastructure.Persistence.Seed;
using Vingo.WebAPI.Middleware;
using Serilog;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog for structured logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();

// Identity — JWT bearer for API clients
builder.Services
    .AddIdentityCore<Vingo.Infrastructure.Identity.VingoUser>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequiredUniqueChars = 1;
    })
    .AddRoles<Microsoft.AspNetCore.Identity.IdentityRole<Guid>>()
    .AddEntityFrameworkStores<VingoDbContext>()
    .AddSignInManager<Microsoft.AspNetCore.Identity.SignInManager<Vingo.Infrastructure.Identity.VingoUser>>();

builder.Services
    .AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Vingo.Infrastructure.Services.JwtTokenGenerator(builder.Configuration).GetValidationParameters();
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

builder.Services.AddScoped<Vingo.Infrastructure.Services.JwtTokenGenerator>();
builder.Services.AddScoped<Vingo.Application.Features.Auth.IAuthService, Vingo.Infrastructure.Services.AuthService>();

// Database - PostgreSQL with Entity Framework Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<VingoDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.MigrationsAssembly(typeof(VingoDbContext).Assembly.FullName);
        npgsql.EnableRetryOnFailure(3);
        npgsql.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
    })
    .UseSnakeCaseNamingConvention());

// Register DbContext as IApplicationDbContext
builder.Services.AddScoped<Vingo.Application.Common.Interfaces.IApplicationDbContext>(provider =>
    provider.GetRequiredService<VingoDbContext>());

// Register Application handlers
// Catalog
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetProducts.GetProductsHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetProductBySlug.GetProductBySlugHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetCategories.GetCategoriesHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetCollections.GetCollectionsHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetCollections.GetCollectionBySlugHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetRooms.GetRoomsHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetRooms.GetRoomBySlugHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetNeeds.GetNeedsHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Queries.GetReviews.GetReviewsHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Catalog.Commands.AddReview.AddReviewHandler>();
// Content
builder.Services.AddScoped<Vingo.Application.Features.Content.Queries.GetInspirationStories.GetInspirationStoriesHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Content.Queries.GetInspirationStories.GetStoryBySlugHandler>();
// Cart
builder.Services.AddScoped<Vingo.Application.Features.Cart.Queries.GetCart.GetCartHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Cart.Commands.AddToCart.AddToCartHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Cart.Commands.UpdateCartItem.UpdateCartItemHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Cart.Commands.RemoveCartItem.RemoveCartItemHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Cart.Commands.RemoveCartItem.ClearCartHandler>();
// Wishlist
builder.Services.AddScoped<Vingo.Application.Features.Wishlist.Commands.AddToWishlist.AddToWishlistHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Wishlist.Commands.RemoveFromWishlist.RemoveFromWishlistHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Wishlist.Commands.RemoveFromWishlist.GetWishlistHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Wishlist.Commands.RemoveFromWishlist.ClearWishlistHandler>();
// Orders
builder.Services.AddScoped<Vingo.Application.Features.Orders.Commands.CreateOrder.CreateOrderHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Orders.Queries.GetOrder.GetOrderHandler>();
// Marketing
builder.Services.AddScoped<Vingo.Application.Features.Marketing.Commands.CreateLead.CreateLeadHandler>();
builder.Services.AddScoped<Vingo.Application.Features.Marketing.Commands.SubscribeNewsletter.SubscribeNewsletterHandler>();

// CORS - Allow frontend origins
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// OpenAPI and Scalar documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Health Checks for monitoring
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString!, name: "postgresql");

// Rate limiting — a fair global ceiling plus a stricter bucket for
// write-heavy marketing endpoints. Keyed per IP.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("marketing", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// Output caching for anonymous reference-data GETs
builder.Services.AddOutputCache();

var app = builder.Build();

// Apply migrations and seed the demo catalogue in Development only.
// Production deploys should run migrations through the pipeline instead.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<VingoDbContext>();

    try
    {
        await db.Database.MigrateAsync();
        await DbSeeder.SeedAsync(db);
        await IdentitySeeder.SeedAsync(scope.ServiceProvider, builder.Configuration);
        Log.Information("Database migrations applied, seed data verified and admin account ready");
    }
    catch (Exception ex)
    {
        Log.Fatal(ex, "Failed to migrate/seed the database. The API cannot serve requests.");
        throw;
    }
}

// Configure the HTTP request pipeline
// Serilog's request logging must wrap the exception filter — otherwise every
// expected business exception (e.g. anonymous refresh probes -> 401) is logged as a 500 with a stack trace.
app.UseSerilogRequestLogging();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
else
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

app.UseOutputCache();

app.MapControllers();

// Health check endpoint for monitoring
app.MapHealthChecks("/health");

// Root status route — the bare domain responds with an API index instead of a 404.
app.MapGet("/", () => Results.Json(new
{
    name = "Vingo Roll API",
    status = "ok",
    version = "1.0",
    environment = app.Environment.EnvironmentName,
    endpoints = app.Environment.IsDevelopment()
        ? new[] { "/health", "/api/v1", "/scalar/v1" }
        : new[] { "/health", "/api/v1" },
}));

Log.Information("🚀 Vingo Roll API starting...");

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
