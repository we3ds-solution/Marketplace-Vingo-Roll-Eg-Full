using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Content;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Review seeds for the canonical demo products.
/// </summary>
public static class SeedReviews
{
    public static List<Review> BuildReviews(List<Product> products)
    {
        var productBySlug = products.ToDictionary(p => p.Slug);

        var seeds = new (string Slug, string Author, int Rating, string Title, string Body, DateTime Date, bool Verified)[]
        {
            ("aurelle-belgian-linen-curtain", "Marion T.", 5, "The hem hangs perfectly",
                "Ordered custom drops for a 10ft ceiling. They arrived pressed and the weighted hem hangs dead straight.",
                new DateTime(2026, 5, 14, 0, 0, 0, DateTimeKind.Utc), true),
            ("aurelle-belgian-linen-curtain", "Devin K.", 4, "Beautiful, order samples first",
                "The oat reads warmer in person than on screen — glad I got the swatches before committing.",
                new DateTime(2026, 4, 2, 0, 0, 0, DateTimeKind.Utc), true),
            ("nocturne-blackout-drape", "Priya S.", 5, "Actually dark",
                "Our toddler finally naps past 6am. No plastic smell, no shine.",
                new DateTime(2026, 6, 11, 0, 0, 0, DateTimeKind.Utc), true),
            ("meridian-motorized-roller-shade", "Alex R.", 5, "Quiet motor",
                "Scheduling sunrise and sunset scenes took five minutes. Genuinely quiet.",
                new DateTime(2026, 3, 27, 0, 0, 0, DateTimeKind.Utc), true),
            ("grove-woven-grass-shade", "Hannah B.", 4, "Lovely texture",
                "Natural variation is real — no two slats identical, which is the point.",
                new DateTime(2026, 2, 19, 0, 0, 0, DateTimeKind.Utc), false),
        };

        return seeds.Select(s =>
        {
            var review = new Review(
                productBySlug[s.Slug].Id,
                s.Author,
                s.Rating,
                s.Title,
                s.Body,
                s.Verified);
            review.Id = Guid.NewGuid();
            review.CreatedAt = s.Date;
            return review;
        }).ToList();
    }
}

