namespace Vingo.Application.Features.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string DisplayName
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthUserDto(
    Guid Id,
    string Email,
    string DisplayName,
    string[] Roles
);

public record AuthResponseDto(
    string AccessToken,
    int ExpiresInMinutes,
    AuthUserDto User
);

/// <summary>
/// Authentication and current-user access. Implemented in Infrastructure.
/// The raw refresh token is returned alongside the DTO — never as part of the
/// JSON contract; the API layer puts it in an HttpOnly cookie.
/// </summary>
public interface IAuthService
{
    Task<(AuthResponseDto Response, string RefreshToken)> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken cancellationToken = default);
    Task<(AuthResponseDto Response, string RefreshToken)> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default);
    Task<(AuthResponseDto Response, string RefreshToken)> RefreshAsync(string? refreshToken, string? ipAddress, CancellationToken cancellationToken = default);
    Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default);
    Task<AuthUserDto?> GetUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
