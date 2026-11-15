using Vingo.Domain.Common;

namespace Vingo.Infrastructure.Identity;

/// <summary>
/// Rotating refresh token. Only the SHA-256 hash is stored.
/// </summary>
public class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? ReplacedByTokenHash { get; private set; }
    public string? CreatedByIp { get; private set; }

    public bool IsActive => RevokedAt == null && ExpiresAt > DateTime.UtcNow;

    private RefreshToken() { } // EF Core

    public RefreshToken(Guid userId, string tokenHash, DateTime expiresAt, string? createdByIp = null)
    {
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
        CreatedByIp = createdByIp;
    }

    public void Revoke(string? replacedByTokenHash = null)
    {
        if (RevokedAt != null)
        {
            return;
        }

        RevokedAt = DateTime.UtcNow;
        ReplacedByTokenHash = replacedByTokenHash;
    }
}
