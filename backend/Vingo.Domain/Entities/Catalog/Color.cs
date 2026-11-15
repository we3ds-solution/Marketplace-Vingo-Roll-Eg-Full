using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class Color : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string HexCode { get; private set; } = string.Empty;
    public string? Family { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<Product> _products = new();
    public IReadOnlyCollection<Product> Products => _products.AsReadOnly();

    private Color() { } // EF Core

    public Color(string name, string hexCode, string? family = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Color name is required");

        if (string.IsNullOrWhiteSpace(hexCode))
            throw new DomainException("Hex code is required");

        Name = name;
        HexCode = hexCode.StartsWith('#') ? hexCode : $"#{hexCode}";
        Family = family;
        IsActive = true;
    }

    /// <summary>Full admin edit.</summary>
    public void UpdateDetails(
        string name,
        string hexCode,
        string? family,
        int sortOrder,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("Color name is required");

        if (string.IsNullOrWhiteSpace(hexCode))
            throw new DomainException("Hex code is required");

        Name = name.Trim();
        HexCode = hexCode.StartsWith('#') ? hexCode.Trim() : $"#{hexCode.Trim()}";
        Family = family;
        SortOrder = sortOrder;
        IsActive = isActive;
        UpdatedAt = DateTime.UtcNow;
    }
}
