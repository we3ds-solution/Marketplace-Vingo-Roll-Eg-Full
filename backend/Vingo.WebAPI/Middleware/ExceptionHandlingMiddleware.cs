using System.Text.Json;

namespace Vingo.WebAPI.Middleware;

/// <summary>
/// Maps known exceptions to stable JSON error responses:
/// 400 validation/domain/argument errors, 404 missing resources,
/// 500 for anything unexpected (logged).
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        switch (exception)
        {
            case Vingo.Application.Common.Exceptions.ValidationException validationException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await WriteJson(context, new
                {
                    error = "Validation failed",
                    errors = validationException.Errors
                });
                return;

            case Vingo.Application.Common.Exceptions.AuthFailedException:
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await WriteJson(context, new { error = "Invalid email or password" });
                return;

            case KeyNotFoundException keyNotFound:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await WriteJson(context, new { error = keyNotFound.Message });
                return;

            case ArgumentException argumentException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await WriteJson(context, new { error = argumentException.Message });
                return;

            case InvalidOperationException invalidOperation:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await WriteJson(context, new { error = invalidOperation.Message });
                return;

            case Vingo.Domain.Common.DomainException domainException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await WriteJson(context, new { error = domainException.Message });
                return;

            default:
                _logger.LogError(exception, "Unhandled exception for {Method} {Path}",
                    context.Request.Method, context.Request.Path);
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await WriteJson(context, new { error = "Something went wrong. Please try again." });
                return;
        }
    }

    private static async Task WriteJson(HttpContext context, object payload)
    {
        await context.Response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
