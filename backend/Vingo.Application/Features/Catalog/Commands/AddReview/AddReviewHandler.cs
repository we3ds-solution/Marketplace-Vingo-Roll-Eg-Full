using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Catalog.Queries.GetReviews;
using Vingo.Domain.Entities.Catalog;

namespace Vingo.Application.Features.Catalog.Commands.AddReview;

public record AddReviewCommand(
    string ProductSlug,
    string Author,
    int Rating,
    string? Title,
    string? Body
);

public class AddReviewValidator : AbstractValidator<AddReviewCommand>
{
    public AddReviewValidator()
    {
        RuleFor(x => x.ProductSlug).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Author).NotEmpty().MaximumLength(80);
        RuleFor(x => x.Rating).InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");
        RuleFor(x => x.Title).MaximumLength(120);
        RuleFor(x => x.Body).MaximumLength(1000);
    }
}

public class AddReviewHandler
{
    private readonly IApplicationDbContext _context;
    private readonly AddReviewValidator _validator = new();

    public AddReviewHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReviewDto> Handle(AddReviewCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Slug == command.ProductSlug && p.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductSlug}' not found");

        var review = new Review(product.Id, command.Author, command.Rating, command.Title, command.Body);
        _context.Reviews.Add(review);

        // Fold the new review into the running aggregate (weighted average)
        product.AddReviewAggregate(command.Rating);

        await _context.SaveChangesAsync(cancellationToken);

        return new ReviewDto
        {
            Id = review.Id,
            ProductSlug = command.ProductSlug,
            Author = review.AuthorName,
            Rating = review.Rating,
            Title = review.Title,
            Body = review.Body,
            Verified = review.IsVerifiedPurchase,
            CreatedAt = review.CreatedAt
        };
    }
}
