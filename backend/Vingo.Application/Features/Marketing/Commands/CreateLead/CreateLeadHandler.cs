using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Marketing;
using Vingo.Domain.Enums;

namespace Vingo.Application.Features.Marketing.Commands.CreateLead;

public record CreateLeadCommand(
    string LeadType,
    string Name,
    string Email,
    string? Phone,
    string? Message,
    string? ProductSlug,
    string? Source
);

public class CreateLeadValidator : AbstractValidator<CreateLeadCommand>
{
    private static readonly string[] AllowedTypes = ["quote", "swatches", "consultation", "contact"];

    public CreateLeadValidator()
    {
        RuleFor(x => x.LeadType)
            .Must(t => AllowedTypes.Contains(t.ToLowerInvariant()))
            .WithMessage("Lead type must be one of: quote, swatches, consultation, contact");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(40);
        RuleFor(x => x.Message).MaximumLength(2000);
        RuleFor(x => x.ProductSlug).MaximumLength(200);
    }
}

public class CreateLeadHandler
{
    private readonly IApplicationDbContext _context;
    private readonly CreateLeadValidator _validator = new();

    public CreateLeadHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LeadDto> Handle(CreateLeadCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var leadType = Enum.Parse<LeadType>(command.LeadType, ignoreCase: true);

        var lead = new Lead(
            leadType,
            command.Name,
            command.Email,
            command.Phone,
            command.Message,
            command.ProductSlug,
            command.Source);

        _context.Leads.Add(lead);
        await _context.SaveChangesAsync(cancellationToken);

        return new LeadDto(
            lead.Id,
            lead.LeadType.ToString(),
            lead.Name,
            lead.Email,
            lead.CreatedAt);
    }
}

public record LeadDto(Guid Id, string Type, string Name, string Email, DateTime CreatedAt);
