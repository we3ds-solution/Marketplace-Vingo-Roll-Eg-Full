using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Catalog;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; private set; }
    public string Url { get; private set; } = string.Empty;
    public string? AltText { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsPrimary { get; private set; }

    private ProductImage() { } // EF Core

    public ProductImage(Guid productId, string url, string? altText, int sortOrder, bool isPrimary)
    {
        ProductId = productId;
        Url = url;
        AltText = altText;
        SortOrder = sortOrder;
        IsPrimary = isPrimary;
    }
}
