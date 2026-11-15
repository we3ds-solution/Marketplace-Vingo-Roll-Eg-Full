using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Marketing;

namespace Vingo.Application.Features.Marketing.Commands.SubscribeNewsletter;

public record SubscribeNewsletterCommand(string Email);

public class SubscribeNewsletterValidator : AbstractValidator<SubscribeNewsletterCommand>
{
    public SubscribeNewsletterValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
    }
}

public class SubscribeNewsletterHandler
{
    private readonly IApplicationDbContext _context;
    private readonly SubscribeNewsletterValidator _validator = new();

    public SubscribeNewsletterHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>Idempotent subscribe: re-activates unsubscribed addresses.</summary>
    public async Task Handle(SubscribeNewsletterCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var email = command.Email.Trim().ToLowerInvariant();

        var existing = await _context.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Email == email, cancellationToken);

        if (existing == null)
        {
            _context.NewsletterSubscribers.Add(new NewsletterSubscriber(email));
        }
        else if (!existing.IsActive)
        {
            existing.Resubscribe();
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
