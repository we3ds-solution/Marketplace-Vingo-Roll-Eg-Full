using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Shopping;

public class Cart : BaseEntity
{
    public Guid? UserId { get; private set; }
    public string? SessionId { get; private set; }

    private readonly List<CartItem> _items = new();
    public IReadOnlyCollection<CartItem> Items => _items.AsReadOnly();

    private Cart() { } // EF Core

    public static Cart CreateForUser(Guid userId)
    {
        return new Cart { UserId = userId };
    }

    public static Cart CreateForGuest(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new DomainException("Session ID is required for guest cart");

        return new Cart { SessionId = sessionId };
    }

    public void AddItem(CartItem item)
    {
        var existing = _items.FirstOrDefault(i => 
            i.ProductId == item.ProductId &&
            i.MaterialId == item.MaterialId &&
            i.ColorId == item.ColorId);

        if (existing != null)
        {
            existing.IncreaseQuantity(item.Quantity);
        }
        else
        {
            _items.Add(item);
        }
    }

    public void RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item != null)
        {
            _items.Remove(item);
        }
    }

    public void UpdateItemQuantity(Guid itemId, int quantity)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new DomainException("Cart item not found");

        item.UpdateQuantity(quantity);
    }

    public void Clear()
    {
        _items.Clear();
    }

    public void AssignToUser(Guid userId)
    {
        UserId = userId;
        SessionId = null;
    }

    public decimal GetSubtotal()
    {
        return _items.Sum(i => i.UnitPrice * i.Quantity);
    }

    public int GetTotalItems()
    {
        return _items.Sum(i => i.Quantity);
    }
}
