using Vingo.Domain.Common;
using Vingo.Domain.Enums;
using Vingo.Domain.ValueObjects;

namespace Vingo.Domain.Entities.Catalog;

public class Product : BaseEntity
{
    public string Slug { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string ShortDescription { get; private set; } = string.Empty;
    public string? LongDescription { get; private set; }
    
    public Money BasePrice { get; private set; } = Money.Zero;
    public Money? CompareAtPrice { get; private set; }
    
    public Guid? CategoryId { get; private set; }
    public Category? Category { get; private set; }
    
    public LightControlType LightControl { get; private set; }

    // Flags
    public bool IsFeatured { get; private set; }
    public bool IsBestseller { get; private set; }
    public bool IsNewArrival { get; private set; }
    public bool IsOnSale { get; private set; }
    public bool IsActive { get; private set; } = true;

    // Merchandising attributes
    public string[] Styles { get; private set; } = [];
    public string FeaturesJson { get; private set; } = "[]";
    public string? SpecificationsJson { get; private set; }
    public string Installation { get; private set; } = "both";
    public bool Motorized { get; private set; }
    public string StockStatus { get; private set; } = "in-stock";

    // Stats
    public decimal Rating { get; private set; }
    public int ReviewCount { get; private set; }
    public int ViewCount { get; private set; }

    // Navigation properties
    private readonly List<ProductImage> _images = new();
    public IReadOnlyCollection<ProductImage> Images => _images.AsReadOnly();

    private readonly List<Material> _materials = new();
    public IReadOnlyCollection<Material> Materials => _materials.AsReadOnly();

    private readonly List<Color> _colors = new();
    public IReadOnlyCollection<Color> Colors => _colors.AsReadOnly();

    private readonly List<Size> _sizes = new();
    public IReadOnlyCollection<Size> Sizes => _sizes.AsReadOnly();

    private readonly List<Room> _rooms = new();
    public IReadOnlyCollection<Room> Rooms => _rooms.AsReadOnly();

    private readonly List<Need> _needs = new();
    public IReadOnlyCollection<Need> Needs => _needs.AsReadOnly();

    private readonly List<Review> _reviews = new();
    public IReadOnlyCollection<Review> Reviews => _reviews.AsReadOnly();

    private readonly List<Collection> _collections = new();
    public IReadOnlyCollection<Collection> Collections => _collections.AsReadOnly();

    private Product() { } // EF Core

    public Product(
        string slug, 
        string name, 
        string shortDescription,
        Money basePrice,
        LightControlType lightControl)
    {
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Slug is required");
        
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Product name is required");

        Slug = slug;
        Name = name;
        ShortDescription = shortDescription;
        BasePrice = basePrice;
        LightControl = lightControl;
        IsActive = true;
    }

    public void UpdatePrice(Money newPrice, Money? compareAtPrice = null)
    {
        BasePrice = newPrice ?? throw new DomainException("Price cannot be null");
        CompareAtPrice = compareAtPrice;
    }

    public void SetFlags(bool? featured = null, bool? bestseller = null,
                         bool? newArrival = null, bool? onSale = null, bool? isActive = null)
    {
        if (featured.HasValue) IsFeatured = featured.Value;
        if (bestseller.HasValue) IsBestseller = bestseller.Value;
        if (newArrival.HasValue) IsNewArrival = newArrival.Value;
        if (onSale.HasValue) IsOnSale = onSale.Value;
        if (isActive.HasValue) IsActive = isActive.Value;
    }

    /// <summary>Full admin edit — scalar catalog fields.</summary>
    public void UpdateDetails(
        string name,
        string shortDescription,
        string? longDescription,
        Money basePrice,
        Money? compareAtPrice,
        Guid? categoryId,
        LightControlType lightControl,
        string installation,
        bool motorized,
        string stockStatus,
        string[] styles,
        string? slug = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Product name is required");

        Name = name.Trim();
        ShortDescription = shortDescription.Trim();
        LongDescription = longDescription;
        BasePrice = basePrice;
        CompareAtPrice = compareAtPrice;
        CategoryId = categoryId;
        LightControl = lightControl;
        Installation = installation;
        Motorized = motorized;
        StockStatus = stockStatus;
        Styles = styles ?? [];

        if (!string.IsNullOrWhiteSpace(slug))
        {
            Slug = slug.Trim().ToLowerInvariant();
        }

        UpdatedAt = DateTime.UtcNow;
    }

    /// <summary>Replace option associations wholesale (admin assignment editors).</summary>
    public void ReplaceOptions(
        IReadOnlyList<Material> materials,
        IReadOnlyList<Color> colors,
        IReadOnlyList<Size> sizes,
        IReadOnlyList<Room> rooms,
        IReadOnlyList<Need> needs,
        IReadOnlyList<Collection> collections)
    {
        _materials.Clear();
        _materials.AddRange(materials);

        _colors.Clear();
        _colors.AddRange(colors);

        _sizes.Clear();
        _sizes.AddRange(sizes);

        _rooms.Clear();
        _rooms.AddRange(rooms);

        _needs.Clear();
        _needs.AddRange(needs);

        _collections.Clear();
        _collections.AddRange(collections);
    }

    public bool RemoveImage(Guid imageId)
    {
        var image = _images.FirstOrDefault(i => i.Id == imageId);
        if (image == null)
            return false;

        _images.Remove(image);
        return true;
    }

    public void SetPrimaryImage(Guid imageId)
    {
        foreach (var image in _images)
        {
            image.SetPrimary(image.Id == imageId);
        }
    }

    public void AddImage(string url, string? altText = null, bool isPrimary = false)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new DomainException("Image URL is required");

        var sortOrder = _images.Count;
        _images.Add(new ProductImage(Id, url, altText, sortOrder, isPrimary));
    }

    public void UpdateRating(decimal rating, int reviewCount)
    {
        if (rating < 0 || rating > 5)
            throw new DomainException("Rating must be between 0 and 5");

        Rating = rating;
        ReviewCount = reviewCount;
    }

    /// <summary>
    /// Fold a newly submitted review into the running aggregate.
    /// The stored Rating/ReviewCount act as the historical baseline, so a
    /// single new review nudges the average rather than replacing it.
    /// </summary>
    public void AddReviewAggregate(int newRating)
    {
        if (newRating < 1 || newRating > 5)
            throw new DomainException("Rating must be between 1 and 5");

        var totalScore = Rating * ReviewCount + newRating;
        ReviewCount += 1;
        Rating = Math.Round(totalScore / ReviewCount, 2);
    }

    public void IncrementViewCount()
    {
        ViewCount++;
    }

    public void AddMaterial(Material material)
    {
        if (!_materials.Contains(material))
            _materials.Add(material);
    }

    public void AddColor(Color color)
    {
        if (!_colors.Contains(color))
            _colors.Add(color);
    }

    public void AddSize(Size size)
    {
        if (!_sizes.Contains(size))
            _sizes.Add(size);
    }

    public void AddRoom(Room room)
    {
        if (!_rooms.Contains(room))
            _rooms.Add(room);
    }

    public void AddNeed(Need need)
    {
        if (!_needs.Contains(need))
            _needs.Add(need);
    }

    public void AddCollection(Collection collection)
    {
        if (!_collections.Contains(collection))
            _collections.Add(collection);
    }

    /// <summary>Merchandising and display details (used by seeds and content admins).</summary>
    public void ConfigureMerchandising(
        string? longDescription,
        string[] styles,
        string featuresJson,
        string? specificationsJson,
        string installation,
        bool motorized,
        string stockStatus)
    {
        LongDescription = longDescription;
        Styles = styles ?? [];
        FeaturesJson = featuresJson;
        SpecificationsJson = specificationsJson;
        Installation = installation;
        Motorized = motorized;
        StockStatus = stockStatus;
    }

    public Money CalculateFinalPrice(Guid? materialId = null, Guid? sizeId = null)
    {
        var finalPrice = BasePrice;

        if (materialId.HasValue)
        {
            var material = _materials.FirstOrDefault(m => m.Id == materialId.Value);
            if (material != null)
            {
                finalPrice += new Money(material.PriceDelta);
            }
        }

        if (sizeId.HasValue)
        {
            var size = _sizes.FirstOrDefault(s => s.Id == sizeId.Value);
            if (size != null)
            {
                finalPrice += new Money(size.PriceDelta);
            }
        }

        return finalPrice;
    }
}
