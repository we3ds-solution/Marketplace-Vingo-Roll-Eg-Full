using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Shopping;

public class Wishlist : BaseEntity
{
    public Guid? UserId { get; private set; }
    public string? SessionId { get; private set; }

    private readonly List<WishlistItem> _items = new();
    public IReadOnlyCollection<WishlistItem> Items => _items.AsReadOnly();

    private Wishlist() { } // EF Core

    public static Wishlist CreateForUser(Guid userId)
    {
        return new Wishlist { UserId = userId };
    }

    public static Wishlist CreateForGuest(string sessionId)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new DomainException("Session ID is required for guest wishlist");

        return new Wishlist { SessionId = sessionId };
    }

    public void AssignToUser(Guid userId)
    {
        UserId = userId;
        SessionId = null;
    }

    public void AddItem(Guid productId)
    {
        if (_items.Any(i => i.ProductId == productId))
            return; // Already in wishlist

        _items.Add(new WishlistItem(Id, productId));
    }

    public void RemoveItem(Guid productId)
    {
        var item = _items.FirstOrDefault(i => i.ProductId == productId);
        if (item != null)
        {
            _items.Remove(item);
        }
    }

    public void Clear()
    {
        _items.Clear();
    }

    public bool Contains(Guid productId)
    {
        return _items.Any(i => i.ProductId == productId);
    }
}
