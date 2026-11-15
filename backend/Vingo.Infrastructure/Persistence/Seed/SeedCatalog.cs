using Vingo.Domain.Entities.Catalog;
using Vingo.Domain.Enums;

namespace Vingo.Infrastructure.Persistence.Seed;

/// <summary>
/// Canonical demo catalogue -- reference data only (sizes, materials, colors,
/// categories, collections, rooms, needs). Ported 1:1 from the frontend lib/data/*.ts.
/// Shared demo database -- do not delete rows by hand.
/// </summary>
public static class SeedCatalog
{
    // ---------------------------------------------------------------- sizes

    public static List<Size> BuildSizes()
    {
        var seeds = new (string Slug, string Label, decimal W, decimal H, decimal Delta)[]
        {
            ("s", "50\" × 84\"", 50, 84, 0m),
            ("m", "50\" × 96\"", 50, 96, 35m),
            ("l", "50\" × 108\"", 50, 108, 70m),
            ("custom", "Custom size", 0, 0, 110m),
        };

        return seeds.Select((s, i) =>
        {
            var size = new Size(s.Slug, s.Label, s.W, s.H, s.Delta);
            size.Id = Guid.NewGuid();
            SeedSupport.Set(size, nameof(Size.SortOrder), i);
            return size;
        }).ToList();
    }

    // ------------------------------------------------------------ materials

    public static List<Material> BuildMaterials()
    {
        var seeds = new (string Slug, string Name, MaterialTier Tier, decimal Delta)[]
        {
            ("belgian-linen", "Belgian Linen", MaterialTier.Essential, 0m),
            ("brushed-cotton", "Brushed Cotton", MaterialTier.Essential, 20m),
            ("wool-blend", "Wool Blend", MaterialTier.Signature, 65m),
            ("silk-velvet", "Silk Velvet", MaterialTier.Couture, 140m),
        };

        return seeds.Select((m, i) =>
        {
            var material = new Material(m.Name, m.Slug, m.Tier, m.Delta);
            material.Id = Guid.NewGuid();
            SeedSupport.Set(material, nameof(Material.SortOrder), i);
            return material;
        }).ToList();
    }

    // --------------------------------------------------------------- colors

    public static List<Color> BuildColors()
    {
        var seeds = new (string Slug, string Name, string Hex, string Family)[]
        {
            ("ivory", "Raw Ivory", "#EFE6D6", "Ivory"),
            ("oat", "Oat", "#DCCDB4", "Neutral"),
            ("clay", "Clay", "#B08A6B", "Warm"),
            ("walnut", "Walnut", "#6B4B34", "Brown"),
            ("espresso", "Espresso", "#3A2A20", "Brown"),
            ("sage", "Dry Sage", "#9AA189", "Green"),
        };

        return seeds.Select((c, i) =>
        {
            var color = new Color(c.Name, c.Hex, c.Family);
            color.Id = Guid.NewGuid();
            SeedSupport.Set(color, nameof(Color.SortOrder), i);
            return color;
        }).ToList();
    }

    // ------------------------------------------------------------ categories

    public static List<Category> BuildCategories()
    {
        var seeds = new (string Slug, string Name, string Tagline, string Desc, string Image, string Group)[]
        {
            ("curtains", "Curtains", "Softness, in full length",
                "Made-to-measure curtains in linen, cotton and velvet — hemmed to the millimetre and finished by hand.",
                Img.LinenClose, "curtains"),
            ("blackout-curtains", "Blackout Curtains", "True darkness, warm hand",
                "Triple-weave and lined blackout panels that quiet a room's light without the plastic look.",
                Img.Blackout, "curtains"),
            ("sheers", "Sheer Curtains", "Light, filtered gently",
                "Airy voiles and open-weave linens that turn daylight into something softer.",
                Img.Sheer, "curtains"),
            ("thermal-curtains", "Thermal Curtains", "Comfort you can feel",
                "Insulating interlined panels that hold warmth in winter and heat out in summer.",
                Img.Thermal, "curtains"),
            ("drapery", "Drapery", "Architectural fall",
                "Pinch pleat, ripplefold and goblet headings for rooms with ceiling to spare.",
                Img.Drapery, "curtains"),
            ("roller-shades", "Roller Shades", "Quiet minimalism",
                "Clean cassette rollers in solar, light-filtering and blackout fabrics.",
                Img.Woven, "shades"),
            ("roman-shades", "Roman Shades", "Tailored folds",
                "Flat-fold and relaxed roman shades cut from upholstery-grade cloth.",
                Img.Woven, "shades"),
            ("blinds", "Blinds", "Precise light control",
                "Aluminium and composite slat blinds engineered for daily use.",
                Img.Woven, "blinds"),
            ("wood-woven", "Wood & Woven", "Grain and texture",
                "Real hardwood blinds and woven grass shades with natural variation.",
                Img.Woven, "blinds"),
            ("smart-motorized", "Smart & Motorized", "Light on schedule",
                "Whisper-quiet motors, scenes and cordless child-safe operation.",
                Img.Bedroom, "specialty"),
            ("sale", "Sale", "Seasonal archive",
                "Discontinued colourways and end-of-bolt fabrics, while they last.",
                Img.Linen, "specialty"),
        };

        return seeds.Select((c, i) =>
        {
            var category = new Category(c.Name, c.Slug, c.Desc, c.Image, c.Tagline, c.Group);
            category.Id = Guid.NewGuid();
            SeedSupport.Set(category, nameof(Category.SortOrder), i);
            return category;
        }).ToList();
    }

    // ---------------------------------------------------------- collections

    public static List<Collection> BuildCollections()
    {
        var seeds = new (string Slug, string Name, string Mood, string Story, string Desc, string Image)[]
        {
            ("designer", "The Designer Edit",
                "Considered, tailored, quietly grand",
                "Pieces we developed with interior designers who kept asking for the same three things: a truer black-out, a softer hand, and a hem that hangs straight after year five.",
                "Our most tailored made-to-order drapery and shades.", Img.Drapery),
            ("natural-textures", "Natural Textures",
                "Raw fibre, honest weave",
                "Linen, jute, reed and cotton left close to their original state — slubs, variation and all.",
                "Undyed and low-process materials with visible weave.", Img.Linen),
            ("minimal", "Minimal",
                "Nothing extra",
                "Recessed cassettes, invisible hardware and a single unbroken plane of fabric.",
                "Clean lines for architectural interiors.", Img.Woven),
            ("classic", "Classic",
                "Traditional proportions",
                "Pinch pleats, cloth tapes and interlining — the details that made drapery an art.",
                "Time-tested headings and finishes.", Img.Velvet),
            ("contemporary", "Contemporary",
                "Sharp and quiet",
                "Matte finishes, deep tones and motorised operation for modern rooms.",
                "Modern silhouettes and smart operation.", Img.Blackout),
            ("seasonal", "Seasonal Archive",
                "Last of the bolt",
                "Colourways we are retiring, offered until the fabric runs out.",
                "End-of-run fabrics at reduced pricing.", Img.Woven),
        };

        return seeds.Select((c, i) =>
        {
            var collection = new Collection(c.Name, c.Slug, c.Desc, c.Mood, c.Story);
            collection.Id = Guid.NewGuid();
            SeedSupport.Set(collection, nameof(Collection.SortOrder), i);
            SeedSupport.Set(collection, nameof(Collection.ImageUrl), c.Image);
            return collection;
        }).ToList();
    }

    // ---------------------------------------------------------------- rooms

    public static List<Room> BuildRooms()
    {
        var seeds = new (string Slug, string Name, string Desc, string Image, string[] Recommended)[]
        {
            ("living-room", "Living Room",
                "Full-height drapery and sheers that soften a big window wall.",
                Img.Hero, ["drapery", "sheers", "wood-woven"]),
            ("bedroom", "Bedroom",
                "Blackout layers for real darkness, with a sheer underneath for daytime.",
                Img.Bedroom, ["blackout-curtains", "roller-shades", "smart-motorized"]),
            ("dining-room", "Dining Room",
                "Textured drapery that flatters evening light and candlelight.",
                Img.Hero, ["drapery", "curtains"]),
            ("home-office", "Home Office",
                "Glare control for screens without turning the room into a cave.",
                Img.Woven, ["roller-shades", "blinds"]),
            ("kids-room", "Kids Room",
                "Cordless, child-safe treatments and reliable nap-time darkness.",
                Img.Bedroom, ["blackout-curtains", "roller-shades"]),
            ("kitchen", "Kitchen",
                "Wipeable, short-drop shades that clear the counter.",
                Img.Woven, ["roman-shades", "blinds"]),
            ("bathroom", "Bathroom",
                "Privacy-first materials that tolerate humidity.",
                Img.Woven, ["roller-shades", "roman-shades"]),
            ("patio-outdoor", "Patio & Outdoor",
                "UV-stable weaves for porches, pergolas and coastal glare.",
                Img.Woven, ["wood-woven", "roller-shades"]),
        };

        return seeds.Select((r, i) =>
        {
            var room = new Room(r.Slug, r.Name, r.Desc, r.Image, r.Recommended);
            room.Id = Guid.NewGuid();
            SeedSupport.Set(room, nameof(Room.SortOrder), i);
            return room;
        }).ToList();
    }

    // ---------------------------------------------------------------- needs

    public static List<Need> BuildNeeds()
    {
        var seeds = new (string Slug, string Name, string Description, string Icon)[]
        {
            ("blackout", "Blackout", "Block light for sleep, nurseries and media rooms.", "moon"),
            ("privacy", "Privacy", "Stay unseen without losing all daylight.", "eye-off"),
            ("heat-control", "Heat Control", "Insulate against summer heat and winter draughts.", "thermometer"),
            ("light-filtering", "Light Filtering", "Soften glare while keeping the room bright.", "sun"),
            ("noise-reduction", "Noise Reduction", "Heavier interlined fabrics that absorb street sound.", "volume-x"),
            ("easy-installation", "Easy Installation", "Bracket-and-click systems you can fit in an afternoon.", "wrench"),
            ("smart-motorized", "Smart & Motorized", "Scheduled, app-controlled and cordless operation.", "zap"),
            ("small-windows", "Small Windows", "Short drops and tidy inside mounts.", "minimize-2"),
            ("large-windows", "Large Windows", "Wide spans, tall drops and multi-panel tracks.", "maximize-2"),
        };

        return seeds.Select((n, i) =>
        {
            var need = new Need(n.Slug, n.Name, n.Description, n.Icon);
            need.Id = Guid.NewGuid();
            SeedSupport.Set(need, nameof(Need.SortOrder), i);
            return need;
        }).ToList();
    }
}
