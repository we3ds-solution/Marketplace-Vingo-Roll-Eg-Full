using Vingo.Domain.Common;
using Vingo.Domain.Enums;

namespace Vingo.Domain.Entities.Account;

/// <summary>
/// A request from a registered user to become a vendor.
/// Approval is a manual, admin-gated step — accounts stay customers until approved.
/// </summary>
public class VendorApplication : BaseEntity
{
    public Guid UserId { get; private set; }
    public string CompanyName { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public VendorApplicationStatus Status { get; private set; } = VendorApplicationStatus.Pending;
    public DateTime? DecidedAt { get; private set; }
    public Guid? DecidedBy { get; private set; }

    private VendorApplication() { } // EF Core

    public VendorApplication(Guid userId, string companyName, string message)
    {
        if (string.IsNullOrWhiteSpace(companyName))
            throw new DomainException("Company name is required");

        UserId = userId;
        CompanyName = companyName.Trim();
        Message = (message ?? string.Empty).Trim();
        Status = VendorApplicationStatus.Pending;
    }

    public void Approve(Guid decidedBy)
    {
        Status = VendorApplicationStatus.Approved;
        DecidedAt = DateTime.UtcNow;
        DecidedBy = decidedBy;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Reject(Guid decidedBy, string? reason = null)
    {
        Status = VendorApplicationStatus.Rejected;
        DecidedAt = DateTime.UtcNow;
        DecidedBy = decidedBy;
        if (!string.IsNullOrWhiteSpace(reason))
        {
            Message = reason.Trim();
        }

        UpdatedAt = DateTime.UtcNow;
    }
}
