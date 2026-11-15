using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vingo.Application.Features.Auth;

namespace Vingo.WebAPI.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private const string RefreshCookieName = "vingo_refresh";
    private const string RefreshCookiePath = "/api/v1/auth";

    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    /// <summary>
    /// Register a new customer account
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var (response, refreshToken) = await _authService.RegisterAsync(
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        AppendRefreshCookie(refreshToken);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Sign in with email and password
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var (response, refreshToken) = await _authService.LoginAsync(
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        AppendRefreshCookie(refreshToken);
        return Ok(response);
    }

    /// <summary>
    /// Rotate the refresh token and issue a new access token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies[RefreshCookieName];
        var (response, newRefreshToken) = await _authService.RefreshAsync(
            refreshToken,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        AppendRefreshCookie(newRefreshToken);
        return Ok(response);
    }

    /// <summary>
    /// Revoke the current refresh token
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var refreshToken = Request.Cookies[RefreshCookieName];
        await _authService.LogoutAsync(refreshToken, cancellationToken);

        Response.Cookies.Delete(RefreshCookieName, new CookieOptions { Path = RefreshCookiePath });
        return NoContent();
    }

    /// <summary>
    /// Get the current signed-in user
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(AuthUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (sub == null || !Guid.TryParse(sub, out var userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserAsync(userId, cancellationToken);
        return user == null ? Unauthorized() : Ok(user);
    }

    private void AppendRefreshCookie(string refreshToken)
    {
        var ttl = _configuration.GetValue("JwtSettings:RefreshTokenExpiryDays", 30);

        Response.Cookies.Append(RefreshCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
            Path = RefreshCookiePath,
            Expires = DateTimeOffset.UtcNow.AddDays(ttl),
            IsEssential = true
        });
    }
}
