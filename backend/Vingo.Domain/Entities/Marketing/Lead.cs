using Vingo.Domain.Common;
using Vingo.Domain.Enums;

namespace Vingo.Domain.Entities.Marketing;

public class Lead : BaseEntity
{
    public LeadType LeadType { get; private set; }
    public LeadStatus Status { get; private set; }

    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string? Message { get; private set; }

    public string? ProductSlug { get; private set; }
    public string? Source { get; private set; }

    private Lead() { } // EF Core

    public Lead(
        LeadType leadType,
        string name,
        string email,
        string? phone = null,
        string? message = null,
        string? productSlug = null,
        string? source = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Name is required");

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new DomainException("A valid email is required");

        LeadType = leadType;
        Status = LeadStatus.New;
        Name = name.Trim();
        Email = email.Trim().ToLowerInvariant();
        Phone = phone;
        Message = message;
        ProductSlug = productSlug;
        Source = source;
    }

    public void MarkContacted() => Status = LeadStatus.Contacted;
    public void MarkQualified() => Status = LeadStatus.Qualified;
    public void Close() => Status = LeadStatus.Closed;
    public void SetStatus(LeadStatus status) => Status = status;
}
