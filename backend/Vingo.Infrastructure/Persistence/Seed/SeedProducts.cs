using System.Text.Json;
using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Enums;
using Vingo.Domain.ValueObjects;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Product seed — canonical made-to-order catalogue with images, pricing,
/// options and merchandising flags. Ported 1:1 from the frontend's lib/data/products.ts.
/// </summary>
public static class SeedProducts
{
    private static readonly string[] FeatureBullets =
    [
        "Made to order in our own workroom",
        "Weighted, hand-finished hem",
        "Child-safe cordless operation available",
        "Free fabric samples before you commit"
    ];

    private static readonly Dictionary<string, string> DefaultSpecifications = new()
    {
        ["Composition"] = "Natural fibre blend",
        ["Heading"] = "Ripplefold / pinch pleat / rod pocket",
        ["Mounting"] = "Inside or outside mount",
        ["Care"] = "Dry clean or cool gentle wash",
        ["Lead time"] = "3–4 weeks",
        ["Warranty"] = "5 years on hardware",
    };

    private sealed record ProductSeed(
        string Slug,
        string Name,
        string CategorySlug,
        decimal Price,
        decimal? CompareAtPrice,
        string Short,
        LightControlType LightControl,
        string[] RoomSlugs,
        string[] NeedSlugs,
        string[] Styles,
        string Image,
        string[]? Gallery,
        string? CollectionSlug,
        bool? Motorized,
        bool Featured,
        bool Bestseller,
        bool NewArrival,
        bool Sale,
        decimal Rating,
        int Reviews);

    private static readonly ProductSeed[] ProductSeeds =
    [
        new("aurelle-belgian-linen-curtain", "Aurelle Belgian Linen Curtain", "curtains",
            289m, null,
            "Stonewashed Belgian linen with a weighted hem and a soft, architectural fall.",
            LightControlType.LightFiltering,
            ["living-room", "bedroom", "dining-room"],
            ["light-filtering", "privacy", "large-windows"],
            ["Minimal", "Natural"],
            "/images/Material/BelgianLinen/Aurelle/Aurelle1.jpg",
            ["/images/Material/BelgianLinen/Aurelle/Aurelle1.jpg",
             "/images/Material/BelgianLinen/Aurelle/Aurelle2.webp",
             "/images/Material/BelgianLinen/Aurelle/Aurelle3.jpg"],
            "natural-textures",
            null, true, true, false, false,
            4.8m, 214),

        new("nocturne-blackout-drape", "Nocturne Blackout Drape", "blackout-curtains",
            349m, 419m,
            "Triple-weave blackout with a matte cotton face — no rubber backing, no shine.",
            LightControlType.Blackout,
            ["bedroom", "kids-room"],
            ["blackout", "noise-reduction", "heat-control"],
            ["Contemporary", "Classic"],
            "/images/Material/BrushedCotton/Nocturne/Nocturne1.webp",
            ["/images/Material/BrushedCotton/Nocturne/Nocturne1.webp",
             "/images/Material/BrushedCotton/Nocturne/Nocturne2.webp",
             "/images/Material/BrushedCotton/Nocturne/Nocturne3.webp"],
            "designer",
            null, true, true, false, true,
            4.9m, 388),

        new("veil-sheer-voile-panel", "Veil Sheer Voile Panel", "sheers",
            169m, null,
            "An open-weave voile that turns hard afternoon light into a warm haze.",
            LightControlType.Sheer,
            ["living-room", "dining-room", "home-office"],
            ["light-filtering", "large-windows"],
            ["Minimal", "Contemporary"],
            "/images/products/SheerCurtains/VoilePanel/VoilePanel.jpg",
            ["/images/products/SheerCurtains/VoilePanel/VoilePanel.jpg",
             "/images/products/SheerCurtains/VoilePanel/VoilePanel2.webp",
             "/images/products/SheerCurtains/VoilePanel/VoilePanel3.avif"],
            "minimal",
            null, true, false, false, false,
            4.6m, 121),

        new("hearth-thermal-interlined-curtain", "Hearth Thermal Interlined Curtain", "thermal-curtains",
            399m, null,
            "Three-layer interlining that steadies room temperature and hushes street noise.",
            LightControlType.Blackout,
            ["living-room", "bedroom"],
            ["heat-control", "noise-reduction", "blackout"],
            ["Classic"],
            "/images/products/Thermal/Thermal1.png",
            ["/images/products/Thermal/Thermal1.png",
             "/images/products/Thermal/Thermal2.webp",
             "/images/products/Thermal/Thermal3.jpg"],
            "classic",
            null, false, true, false, false,
            4.7m, 96),

        new("atelier-pinch-pleat-drapery", "Atelier Pinch Pleat Drapery", "drapery",
            529m, null,
            "Hand-finished French pleats for ceilings that deserve the full gesture.",
            LightControlType.LightFiltering,
            ["living-room", "dining-room"],
            ["large-windows", "privacy"],
            ["Classic", "Designer"],
            "/images/products/Draper/Draper1.jpg",
            ["/images/products/Draper/Draper1.jpg",
             "/images/products/Draper/Draper2.webp",
             "/images/products/Draper/Draper3.jpg"],
            "designer",
            null, true, false, false, false,
            4.9m, 64),

        new("solstice-solar-roller-shade", "Solstice Solar Roller Shade", "roller-shades",
            199m, null,
            "5% openness solar screen that cuts glare while keeping the view.",
            LightControlType.LightFiltering,
            ["home-office", "living-room", "kitchen"],
            ["heat-control", "easy-installation", "light-filtering"],
            ["Minimal"],
            Img.Woven,
            null,
            "minimal",
            null, false, false, false, false,
            4.5m, 152),

        new("meridian-motorized-roller-shade", "Meridian Motorized Roller Shade", "smart-motorized",
            649m, null,
            "Rechargeable lithium motor, app scenes and a cordless, child-safe front.",
            LightControlType.Blackout,
            ["bedroom", "living-room", "home-office"],
            ["smart-motorized", "blackout", "large-windows"],
            ["Contemporary"],
            Img.Bedroom,
            null,
            "contemporary",
            true, true, false, true, false,
            4.8m, 73),

        new("canton-flat-fold-roman-shade", "Canton Flat-Fold Roman Shade", "roman-shades",
            289m, null,
            "Crisp flat folds in upholstery-weight cloth, mounted inside or out.",
            LightControlType.LightFiltering,
            ["kitchen", "bathroom", "bedroom"],
            ["privacy", "small-windows"],
            ["Classic", "Natural"],
            Img.Woven,
            null,
            "classic",
            null, false, false, false, false,
            4.6m, 88),

        new("grove-woven-grass-shade", "Grove Woven Grass Shade", "wood-woven",
            239m, null,
            "Hand-woven reed and jute with the natural variation of a real material.",
            LightControlType.LightFiltering,
            ["living-room", "patio-outdoor", "dining-room"],
            ["light-filtering", "easy-installation"],
            ["Natural"],
            Img.Woven,
            null,
            "natural-textures",
            null, false, true, false, false,
            4.7m, 176),

        new("linden-hardwood-blind", "Linden Hardwood Blind", "blinds",
            219m, null,
            "2.5\" basswood slats with cloth tapes and a matte hand-rubbed finish.",
            LightControlType.LightFiltering,
            ["home-office", "living-room", "kitchen"],
            ["privacy", "easy-installation", "small-windows"],
            ["Classic"],
            Img.Woven,
            null,
            null,
            null, false, false, false, false,
            4.5m, 133),

        new("dune-sheer-linen-blend", "Dune Sheer Linen Blend", "sheers",
            149m, 189m,
            "A sand-toned sheer with just enough body to hang straight.",
            LightControlType.Sheer,
            ["bedroom", "kids-room", "home-office"],
            ["light-filtering", "small-windows"],
            ["Natural", "Minimal"],
            "/images/products/SheerCurtains/LinenBlend/dune-sheer-linen-blend.jpg",
            ["/images/products/SheerCurtains/LinenBlend/dune-sheer-linen-blend.jpg",
             "/images/products/SheerCurtains/LinenBlend/dune-sheer-linen-blend-2.webp",
             "/images/products/SheerCurtains/LinenBlend/dune-sheer-linen-blend-3.webp"],
            "seasonal",
            null, false, false, false, true,
            4.4m, 59),

        new("obsidian-blackout-roller", "Obsidian Blackout Roller", "roller-shades",
            259m, null,
            "Side channels and a light-sealing cassette for a genuinely dark room.",
            LightControlType.Blackout,
            ["bedroom", "kids-room", "home-office"],
            ["blackout", "smart-motorized", "heat-control"],
            ["Contemporary"],
            Img.Bedroom,
            null,
            "contemporary",
            null, false, false, true, false,
            4.7m, 102),

        new("marsh-velvet-drape", "Marsh Silk Velvet Drape", "drapery",
            689m, null,
            "Deep pile silk velvet that reads espresso by day and near-black at night.",
            LightControlType.Blackout,
            ["living-room", "dining-room", "bedroom"],
            ["blackout", "noise-reduction"],
            ["Designer", "Classic"],
            "/images/Material/SilkVelvet/VelvetDrape1.jpg",
            ["/images/Material/SilkVelvet/VelvetDrape1.jpg",
             "/images/Material/SilkVelvet/VelvetDrape2.jpg",
             "/images/Material/SilkVelvet/VelvetDrape3.jpg"],
            "designer",
            null, true, false, false, false,
            4.9m, 41),

        new("harbor-outdoor-shade", "Harbor Outdoor Shade", "wood-woven",
            279m, null,
            "UV-stable weave built for porches, patios and coastal light.",
            LightControlType.LightFiltering,
            ["patio-outdoor", "kitchen"],
            ["heat-control", "easy-installation", "large-windows"],
            ["Natural", "Contemporary"],
            Img.Woven,
            null,
            "seasonal",
            null, false, false, false, false,
            4.3m, 37),
    ];

    /// <summary>Fabric options a product offers, derived from its base price.</summary>
    private static IEnumerable<Material> MaterialsFor(decimal price, List<Material> materials)
    {
        if (price >= 400m) return materials;
        if (price >= 250m) return materials.Where(m => m.Tier != MaterialTier.Couture);
        return materials.Where(m => m.Tier == MaterialTier.Essential);
    }

    public static List<Product> BuildProducts(
        List<Category> categories,
        List<Material> materials,
        List<Color> colors,
        List<Size> sizes,
        List<Room> rooms,
        List<Need> needs,
        List<Collection> collections)
    {
        var categoryBySlug = categories.ToDictionary(c => c.Slug);
        var collectionBySlug = collections.ToDictionary(c => c.Slug);
        var roomBySlug = rooms.ToDictionary(r => r.Slug);
        var needBySlug = needs.ToDictionary(n => n.Slug);

        var featuresJson = JsonSerializer.Serialize(FeatureBullets);
        var specsJson = JsonSerializer.Serialize(DefaultSpecifications);
        var products = new List<Product>();

        foreach (var seed in ProductSeeds)
        {
            var category = categoryBySlug[seed.CategorySlug];
            var motorized = seed.Motorized ?? seed.NeedSlugs.Contains("smart-motorized");
            var stockStatus = seed.NewArrival ? "made-to-order" : "in-stock";
            var description =
                $"{seed.Short} Every {seed.Name} is cut to order in our workroom, pressed, and inspected before it ships. " +
                "Choose your fabric, colour and drop — or send us your measurements and we will confirm them with you before cutting.";

            var product = new Product(
                seed.Slug,
                seed.Name,
                seed.Short,
                new Money(seed.Price),
                seed.LightControl)
            {
                Id = Guid.NewGuid()
            };

            SeedSupport.Set(product, nameof(Product.CategoryId), category.Id);
            product.UpdatePrice(new Money(seed.Price),
                seed.CompareAtPrice.HasValue ? new Money(seed.CompareAtPrice.Value) : null);
            product.SetFlags(
                featured: seed.Featured ? true : null,
                bestseller: seed.Bestseller ? true : null,
                newArrival: seed.NewArrival ? true : null,
                onSale: seed.Sale ? true : null);
            product.UpdateRating(seed.Rating, seed.Reviews);
            product.ConfigureMerchandising(
                description,
                seed.Styles,
                featuresJson,
                specsJson,
                "both",
                motorized,
                stockStatus);

            // Images — mirrors the frontend buildGallery()
            var srcs = seed.Gallery is { Length: > 0 } gallery
                ? gallery.Concat([Img.Linen]).Take(4).ToArray()
                : [seed.Image, Img.Hero, Img.Linen, Img.Woven];

            var roomSlugForAlt = seed.RoomSlugs.Length > 0 ? seed.RoomSlugs[0].Replace('-', ' ') : "living room";
            var alts = new[]
            {
                $"{seed.Name} hung in a styled {roomSlugForAlt} — {seed.Short}",
                $"{seed.Name} across a full window wall showing drape and fall",
                $"Close-up of the {seed.Name} fabric weave and colour",
                $"Heading and hardware detail of the {seed.Name}",
            };

            for (var i = 0; i < srcs.Length; i++)
            {
                product.AddImage(srcs[i], alts[i], isPrimary: i == 0);
            }

            // Options & associations
            foreach (var material in MaterialsFor(seed.Price, materials))
            {
                product.AddMaterial(material);
            }

            foreach (var color in colors)
            {
                product.AddColor(color);
            }

            foreach (var size in sizes)
            {
                product.AddSize(size);
            }

            foreach (var roomSlug in seed.RoomSlugs)
            {
                if (roomBySlug.TryGetValue(roomSlug, out var room))
                {
                    product.AddRoom(room);
                }
            }

            foreach (var needSlug in seed.NeedSlugs)
            {
                if (needBySlug.TryGetValue(needSlug, out var need))
                {
                    product.AddNeed(need);
                }
            }

            if (seed.CollectionSlug != null && collectionBySlug.TryGetValue(seed.CollectionSlug, out var collection))
            {
                product.AddCollection(collection);
            }

            products.Add(product);
        }

        return products;
    }
}

