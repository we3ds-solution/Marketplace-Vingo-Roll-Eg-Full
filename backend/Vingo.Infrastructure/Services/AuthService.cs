using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

using FluentValidation;
using FluentValidation.Results;

using Vingo.Application.Common.Exceptions;
using Vingo.Application.Features.Auth;
using ValidationException = Vingo.Application.Common.Exceptions.ValidationException;

namespace Vingo.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<Identity.VingoUser> _userManager;
    private readonly Persistence.VingoDbContext _context;
    private readonly JwtTokenGenerator _jwt;

    public AuthService(
        UserManager<Identity.VingoUser> userManager,
        Persistence.VingoDbContext context,
        JwtTokenGenerator jwt)
    {
        _userManager = userManager;
        _context = context;
        _jwt = jwt;
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        var validator = new RegisterRequestValidator();
        var failures = await validator.ValidateAsync(request, cancellationToken);
        if (!failures.IsValid)
        {
            throw new ValidationException(failures.Errors);
        }

        var email = request.Email.Trim().ToLowerInvariant();

        if (await _userManager.Users.AnyAsync(u => u.Email == email, cancellationToken))
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure("email", "An account with this email already exists")
            });
        }

        var user = new Identity.VingoUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            DisplayName = request.DisplayName.Trim()
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new ValidationException(result.Errors.Select(e => new ValidationFailure("password", e.Description)));
        }

        await _userManager.AddToRoleAsync(user, "Customer");
        return await IssueTokensAsync(user, ipAddress, cancellationToken);
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure("credentials", "Email and password are required")
            });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user == null)
        {
            throw new AuthFailedException();
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            throw new AuthFailedException();
        }

        return await IssueTokensAsync(user, ipAddress, cancellationToken);
    }

    public async Task<(AuthResponseDto Response, string RefreshToken)> RefreshAsync(string? refreshToken, string? ipAddress, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            throw new AuthFailedException();
        }

        var tokenHash = _jwt.HashRefreshToken(refreshToken);

        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (storedToken == null || !storedToken.IsActive)
        {
            throw new AuthFailedException();
        }

        var user = await _userManager.Users
            .FirstOrDefaultAsync(u => u.Id == storedToken.UserId, cancellationToken);

        if (user == null)
        {
            throw new AuthFailedException();
        }

        // Rotate: revoke the presented token, issue a new pair
        var newRefreshToken = _jwt.GenerateRefreshToken();
        storedToken.Revoke(_jwt.HashRefreshToken(newRefreshToken));

        var newTokenHash = _jwt.HashRefreshToken(newRefreshToken);
        var expiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays);

        _context.RefreshTokens.Add(new Identity.RefreshToken(user.Id, newTokenHash, expiresAt, ipAddress));
        await _context.SaveChangesAsync(cancellationToken);

        return await BuildAuthResponseAsync(user, newRefreshToken, cancellationToken);
    }

    public async Task LogoutAsync(string? refreshToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return;
        }

        var tokenHash = _jwt.HashRefreshToken(refreshToken);
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken);

        if (storedToken != null && storedToken.IsActive)
        {
            storedToken.Revoke();
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task<AuthUserDto?> GetUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return null;
        }

        var roles = await _userManager.GetRolesAsync(user);
        return new AuthUserDto(user.Id, user.Email!, user.DisplayName, roles.ToArray());
    }

    private async Task<(AuthResponseDto Response, string RefreshToken)> IssueTokensAsync(Identity.VingoUser user, string? ipAddress, CancellationToken cancellationToken)
    {
        var refreshToken = _jwt.GenerateRefreshToken();
        var tokenHash = _jwt.HashRefreshToken(refreshToken);
        var expiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshTokenDays);

        _context.RefreshTokens.Add(new Identity.RefreshToken(user.Id, tokenHash, expiresAt, ipAddress));
        await _context.SaveChangesAsync(cancellationToken);

        return await BuildAuthResponseAsync(user, refreshToken, cancellationToken);
    }

    private async Task<(AuthResponseDto Response, string RefreshToken)> BuildAuthResponseAsync(Identity.VingoUser user, string refreshToken, CancellationToken cancellationToken)
    {
        var roles = await _userManager.GetRolesAsync(user);

        var accessToken = _jwt.GenerateAccessToken(user.Id, user.Email!, user.DisplayName, roles);
        var authUser = new AuthUserDto(user.Id, user.Email!, user.DisplayName, roles.ToArray());

        return (new AuthResponseDto(accessToken, _jwt.AccessTokenMinutes, authUser), refreshToken);
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120)
            .Must(n => !string.IsNullOrWhiteSpace(n.Trim()))
            .WithMessage("Please tell us your name");
        RuleFor(x => x.Password).NotEmpty()
            .MinimumLength(8).WithMessage("Use at least 8 characters")
            .Matches("[0-9]").WithMessage("Add at least one number");
    }
}
