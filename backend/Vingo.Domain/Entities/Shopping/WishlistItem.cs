using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Shopping;

public class WishlistItem : BaseEntity
{
    public Guid WishlistId { get; private set; }
    public Guid ProductId { get; private set; }

    private WishlistItem() { } // EF Core

    public WishlistItem(Guid wishlistId, Guid productId)
    {
        WishlistId = wishlistId;
        ProductId = productId;
    }
}
