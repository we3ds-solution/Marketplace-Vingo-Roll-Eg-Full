using Microsoft.EntityFrameworkCore;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent seeder. Skips when the catalogue is already populated so it is
/// safe to call on every startup in Development.
/// Seed data lives in per-domain files next to this class:
/// SeedCatalog (reference data) -> SeedProducts -> SeedReviews -> SeedInspiration.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(VingoDbContext db, CancellationToken cancellationToken = default)
    {
        if (await db.Products.AnyAsync(cancellationToken))
        {
            return;
        }

        var sizes = SeedCatalog.BuildSizes();
        var materials = SeedCatalog.BuildMaterials();
        var colors = SeedCatalog.BuildColors();
        var categories = SeedCatalog.BuildCategories();
        var collections = SeedCatalog.BuildCollections();
        var rooms = SeedCatalog.BuildRooms();
        var needs = SeedCatalog.BuildNeeds();

        db.Sizes.AddRange(sizes);
        db.Materials.AddRange(materials);
        db.Colors.AddRange(colors);
        db.Categories.AddRange(categories);
        db.Collections.AddRange(collections);
        db.Rooms.AddRange(rooms);
        db.Needs.AddRange(needs);
        await db.SaveChangesAsync(cancellationToken);

        // Products carry m2m links -- add through the aggregate so EF tracks joins
        var products = SeedProducts.BuildProducts(categories, materials, colors, sizes, rooms, needs, collections);
        foreach (var product in products)
        {
            db.Products.Add(product);
        }

        await db.SaveChangesAsync(cancellationToken);

        var reviews = SeedReviews.BuildReviews(products);
        db.Reviews.AddRange(reviews);
        await db.SaveChangesAsync(cancellationToken);

        var stories = SeedInspiration.BuildInspirationStories(products);
        db.InspirationStories.AddRange(stories);
        await db.SaveChangesAsync(cancellationToken);
    }
}
