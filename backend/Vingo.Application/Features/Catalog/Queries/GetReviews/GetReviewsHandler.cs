using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;

namespace Vingo.Application.Features.Catalog.Queries.GetReviews;

public record ReviewDto
{
    public Guid Id { get; init; }
    public string ProductSlug { get; init; } = string.Empty;
    public string Author { get; init; } = string.Empty;
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Body { get; init; }
    public bool Verified { get; init; }
    public DateTime CreatedAt { get; init; }
}

public class GetReviewsHandler
{
    private readonly IApplicationDbContext _context;

    public GetReviewsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewDto>> Handle(string productSlug, CancellationToken cancellationToken = default)
    {
        var reviews = await _context.Reviews
            .AsNoTracking()
            .Where(r => r.Product.Slug == productSlug)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductSlug = r.Product.Slug,
                Author = r.AuthorName,
                Rating = r.Rating,
                Title = r.Title,
                Body = r.Body,
                Verified = r.IsVerifiedPurchase,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return reviews;
    }
}
