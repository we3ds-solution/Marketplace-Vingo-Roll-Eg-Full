using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Shopping;

public class CartItem : BaseEntity
{
    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }

    public Guid? MaterialId { get; private set; }
    public Guid? ColorId { get; private set; }
    public Guid? SizeId { get; private set; }
    public string? Mount { get; private set; }
    public decimal? WidthInches { get; private set; }
    public decimal? HeightInches { get; private set; }

    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }

    private CartItem() { } // EF Core

    public CartItem(
        Guid cartId,
        Guid productId,
        int quantity,
        decimal unitPrice,
        Guid? materialId = null,
        Guid? colorId = null,
        Guid? sizeId = null,
        string? mount = null,
        decimal? widthInches = null,
        decimal? heightInches = null)
    {
        if (quantity <= 0 || quantity > 20)
            throw new DomainException("Quantity must be between 1 and 20");

        if (unitPrice < 0)
            throw new DomainException("Unit price cannot be negative");

        if (mount != null && mount != "inside" && mount != "outside")
            throw new DomainException("Mount must be 'inside' or 'outside'");

        CartId = cartId;
        ProductId = productId;
        Quantity = quantity;
        UnitPrice = unitPrice;
        MaterialId = materialId;
        ColorId = colorId;
        SizeId = sizeId;
        Mount = mount;
        WidthInches = widthInches;
        HeightInches = heightInches;
    }

    public void UpdateQuantity(int quantity)
    {
        if (quantity <= 0 || quantity > 20)
            throw new DomainException("Quantity must be between 1 and 20");

        Quantity = quantity;
    }

    public void IncreaseQuantity(int amount = 1)
    {
        if (Quantity + amount > 20)
            throw new DomainException("Cannot exceed maximum quantity of 20");

        Quantity += amount;
    }

    public decimal GetTotalPrice()
    {
        return UnitPrice * Quantity;
    }
}
