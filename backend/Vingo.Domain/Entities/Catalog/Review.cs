using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Review : BaseEntity
{
    public Guid ProductId { get; private set; }
    public Product Product { get; private set; } = null!;

    public string AuthorName { get; private set; } = string.Empty;
    public int Rating { get; private set; }
    public string? Title { get; private set; }
    public string? Body { get; private set; }
    public bool IsVerifiedPurchase { get; private set; }

    private Review() { } // EF Core

    public Review(
        Guid productId,
        string authorName,
        int rating,
        string? title,
        string? body,
        bool isVerifiedPurchase = false)
    {
        if (productId == Guid.Empty)
            throw new DomainException("Product is required");

        if (string.IsNullOrWhiteSpace(authorName))
            throw new DomainException("Author name is required");

        if (rating < 1 || rating > 5)
            throw new DomainException("Rating must be between 1 and 5");

        ProductId = productId;
        AuthorName = authorName.Trim();
        Rating = rating;
        Title = title;
        Body = body;
        IsVerifiedPurchase = isVerifiedPurchase;
    }
}
