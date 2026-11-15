using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Vingo.Infrastructure.Services;

public class JwtTokenGenerator
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;
    private readonly int _refreshTokenExpiryDays;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        var jwt = configuration.GetSection("JwtSettings");
        _secret = jwt["Secret"]
            ?? throw new InvalidOperationException("JwtSettings:Secret is not configured");
        _issuer = jwt["Issuer"] ?? "VingoRollAPI";
        _audience = jwt["Audience"] ?? "VingoRollClient";
        _expiryMinutes = int.TryParse(jwt["ExpiryMinutes"], out var minutes) ? minutes : 15;
        _refreshTokenExpiryDays = int.TryParse(jwt["RefreshTokenExpiryDays"], out var days) ? days : 30;
    }

    public int AccessTokenMinutes => _expiryMinutes;
    public int RefreshTokenDays => _refreshTokenExpiryDays;

    public string GenerateAccessToken(Guid userId, string email, string displayName, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("name", displayName)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public string HashRefreshToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    public TokenValidationParameters GetValidationParameters()
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = _issuer,
            ValidAudience = _audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    }
}
