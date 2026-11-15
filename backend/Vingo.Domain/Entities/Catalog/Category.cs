using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    
    public Guid? ParentId { get; private set; }
    public Category? Parent { get; private set; }
    
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<Category> _children = new();
    public IReadOnlyCollection<Category> Children => _children.AsReadOnly();

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Category() { } // EF Core

    public Category(string name, string slug, string? description = null, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Category name is required");
        
        if (string.IsNullOrWhiteSpace(slug))
            throw new DomainException("Category slug is required");

        Name = name;
        Slug = slug;
        Description = description;
        ImageUrl = imageUrl;
        IsActive = true;
    }

    public void Update(string name, string slug, string? description = null, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Category name is required");

        Name = name;
        Slug = slug;
        Description = description;
        ImageUrl = imageUrl;
    }

    public void SetParent(Category parent)
    {
        Parent = parent;
        ParentId = parent.Id;
    }
}
