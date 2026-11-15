using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Entities.Content;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Editorial inspiration stories — hero copy, body sections and linked products.
/// </summary>
public static class SeedInspiration
{
    public static List<InspirationStory> BuildInspirationStories(List<Product> products)
    {
        var productBySlug = products.ToDictionary(p => p.Slug);

        var seeds = new (string Slug, string Title, string Excerpt, string[] Body,
            string Room, string Style, string Treatment, string Image, string[] ProductSlugs)[]
        {
            ("a-quiet-living-room-in-linen", "A Quiet Living Room in Linen",
                "Wall-to-wall sheers that make a west-facing room usable at 5pm.",
                ["The brief was simple: keep the view, lose the glare. We ran a single unbroken ripplefold track the full width of the glazing so the fabric reads as a wall rather than as a set of panels.",
                 "Everything else in the room stays low and quiet — a stone table, a jute rug, one cane chair — so the light does the work."],
                "living-room", "Minimal", "sheers", Img.Hero,
                ["veil-sheer-voile-panel", "aurelle-belgian-linen-curtain"]),

            ("true-dark-a-bedroom-study", "True Dark: A Bedroom Study",
                "Layered blackout drapery over a motorised roller for genuine nighttime dark.",
                ["Blackout fabric alone rarely gives you a dark room; light comes around the edges. Here a side-channel roller handles the seal and the drape handles the feeling.",
                 "The result is a room that reads warm brown at dusk and disappears entirely at night."],
                "bedroom", "Contemporary", "blackout-curtains", Img.Bedroom,
                ["nocturne-blackout-drape", "meridian-motorized-roller-shade"]),

            ("woven-shades-and-morning-kitchens", "Woven Shades and Morning Kitchens",
                "Reed shades cut short to clear the counter and catch early sun.",
                ["Kitchens punish long fabric. Woven reed at sill height gives texture without collecting cooking residue.",
                 "We mounted outside the recess to gain three inches of visual height."],
                "kitchen", "Natural", "wood-woven", Img.Woven,
                ["grove-woven-grass-shade", "canton-flat-fold-roman-shade"]),

            ("an-office-without-glare", "An Office Without Glare",
                "A 5% solar screen that keeps the skyline and kills the screen reflection.",
                ["Solar screens are measured by openness factor. At 5% you keep a legible view out while cutting most of the direct glare.",
                 "Pair with a hardwood blind on the side window for afternoon control."],
                "home-office", "Minimal", "roller-shades", Img.Woven,
                ["solstice-solar-roller-shade", "linden-hardwood-blind"]),

            ("dining-in-velvet", "Dining in Velvet",
                "Silk velvet drapery that shifts colour as the evening goes on.",
                ["Velvet is a lighting material as much as a textile — the pile catches low light and deepens.",
                 "We kept the heading simple so the fabric stays the subject."],
                "dining-room", "Classic", "drapery", Img.Bedroom,
                ["marsh-velvet-drape", "atelier-pinch-pleat-drapery"]),

            ("a-porch-that-stays-cool", "A Porch That Stays Cool",
                "Outdoor weaves that drop the temperature under a west-facing pergola.",
                ["Shade fabric outside the glass stops heat before it enters — far more effective than any interior treatment.",
                 "UV-stable yarns keep the colour honest through a full season."],
                "patio-outdoor", "Natural", "wood-woven", Img.Woven,
                ["harbor-outdoor-shade", "grove-woven-grass-shade"]),
        };

        var stories = new List<InspirationStory>();

        for (var i = 0; i < seeds.Length; i++)
        {
            var seed = seeds[i];
            var story = new InspirationStory(
                seed.Slug,
                seed.Title,
                seed.Excerpt,
                seed.Image,
                seed.Room,
                seed.Style,
                seed.Treatment);
            story.Id = Guid.NewGuid();
            SeedSupport.Set(story, nameof(InspirationStory.SortOrder), i);

            foreach (var paragraph in seed.Body)
            {
                story.AddSection(paragraph);
            }

            foreach (var productSlug in seed.ProductSlugs)
            {
                if (productBySlug.TryGetValue(productSlug, out var product))
                {
                    story.AddProduct(product);
                }
            }

            stories.Add(story);
        }

        return stories;
    }
}

