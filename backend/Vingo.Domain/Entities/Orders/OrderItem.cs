using Vingo.Domain.Common;
using Vingo.Domain.ValueObjects;

namespace Vingo.Domain.Entities.Orders;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    
    // Snapshot of product details at time of order
    public string ProductName { get; private set; } = string.Empty;
    public string ProductSlug { get; private set; } = string.Empty;
    public string? MaterialName { get; private set; }
    public string? ColorName { get; private set; }
    public string? SizeLabel { get; private set; }
    public string? Mount { get; private set; }
    public decimal? WidthInches { get; private set; }
    public decimal? HeightInches { get; private set; }

    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; } = Money.Zero;
    public Money TotalPrice { get; private set; } = Money.Zero;

    private OrderItem() { } // EF Core

    public OrderItem(
        Guid productId,
        string productName,
        string productSlug,
        int quantity,
        Money unitPrice,
        string? materialName = null,
        string? colorName = null,
        string? sizeLabel = null,
        string? mount = null,
        decimal? widthInches = null,
        decimal? heightInches = null)
    {
        if (quantity <= 0)
            throw new DomainException("Quantity must be positive");

        ProductId = productId;
        ProductName = productName;
        ProductSlug = productSlug;
        Quantity = quantity;
        UnitPrice = unitPrice;
        MaterialName = materialName;
        ColorName = colorName;
        SizeLabel = sizeLabel;
        Mount = mount;
        WidthInches = widthInches;
        HeightInches = heightInches;

        TotalPrice = unitPrice * quantity;
    }
}
