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
                         bool? newArrival = null, bool? onSale = null)
    {
        if (featured.HasValue) IsFeatured = featured.Value;
        if (bestseller.HasValue) IsBestseller = bestseller.Value;
        if (newArrival.HasValue) IsNewArrival = newArrival.Value;
        if (onSale.HasValue) IsOnSale = onSale.Value;
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

    public void IncrementViewCount()
    {
        ViewCount++;
    }

    public Money CalculateFinalPrice(Guid? materialId = null, decimal? customWidth = null)
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

        // Size-based pricing logic can be added here

        return finalPrice;
    }
}
