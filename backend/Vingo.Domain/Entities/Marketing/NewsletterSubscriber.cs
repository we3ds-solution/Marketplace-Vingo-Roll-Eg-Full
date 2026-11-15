using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Marketing;

public class NewsletterSubscriber : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public DateTime? UnsubscribedAt { get; private set; }

    private NewsletterSubscriber() { } // EF Core

    public NewsletterSubscriber(string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new DomainException("A valid email is required");

        Email = email.Trim().ToLowerInvariant();
        IsActive = true;
    }

    public void Resubscribe()
    {
        IsActive = true;
        UnsubscribedAt = null;
    }

    public void Unsubscribe()
    {
        IsActive = false;
        UnsubscribedAt = DateTime.UtcNow;
    }
}
