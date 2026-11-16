using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Account;

/// <summary>
/// In-app notification for a user — e.g. vendor application decisions.
/// </summary>
public class AppNotification : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public bool IsRead { get; private set; }

    private AppNotification() { } // EF Core

    public AppNotification(Guid userId, string title, string body)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("Notification title is required");

        UserId = userId;
        Title = title.Trim();
        Body = (body ?? string.Empty).Trim();
    }

    public void MarkRead()
    {
        IsRead = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
