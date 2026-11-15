using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Collection : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int SortOrder { get; private set; }

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Collection() { } // EF Core

    public Collection(string name, string slug, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Collection name is required");

        Name = name;
        Slug = slug;
        Description = description;
        IsActive = true;
    }

    public void AddProduct(Product product)
    {
        if (!_products.Contains(product))
        {
            _products.Add(product);
        }
    }
}
