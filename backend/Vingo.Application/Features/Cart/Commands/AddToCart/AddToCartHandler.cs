using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Interfaces;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Application.Features.Cart.Commands.AddToCart;

public class AddToCartHandler
{
    private readonly IApplicationDbContext _context;

    public AddToCartHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(AddToCartCommand command, CancellationToken cancellationToken = default)
    {
        // Find or create cart
        Domain.Entities.Shopping.Cart cart;
        
        if (command.UserId.HasValue)
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == command.UserId.Value, cancellationToken);
            
            if (cart == null)
            {
                cart = Domain.Entities.Shopping.Cart.CreateForUser(command.UserId.Value);
                _context.Carts.Add(cart);
            }
        }
        else if (!string.IsNullOrEmpty(command.SessionId))
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.SessionId == command.SessionId, cancellationToken);
            
            if (cart == null)
            {
                cart = Domain.Entities.Shopping.Cart.CreateForGuest(command.SessionId);
                _context.Carts.Add(cart);
            }
        }
        else
        {
            throw new ArgumentException("Either UserId or SessionId must be provided");
        }

        // Get product and calculate price
        var product = await _context.Products
            .Include(p => p.Materials)
            .FirstOrDefaultAsync(p => p.Id == command.ProductId, cancellationToken);
        
        if (product == null)
            throw new KeyNotFoundException($"Product {command.ProductId} not found");

        var unitPrice = product.CalculateFinalPrice(command.MaterialId, command.WidthInches);

        // Create cart item
        var cartItem = new CartItem(
            cart.Id,
            command.ProductId,
            command.Quantity,
            unitPrice.Amount,
            command.MaterialId,
            command.ColorId,
            command.WidthInches,
            command.HeightInches
        );

        cart.AddItem(cartItem);

        await _context.SaveChangesAsync(cancellationToken);

        // Return cart DTO
        return new CartDto
        {
            Id = cart.Id,
            ItemCount = cart.GetTotalItems(),
            Subtotal = cart.GetSubtotal(),
            Items = cart.Items.Select(i => new CartItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.GetTotalPrice()
            }).ToList()
        };
    }
}

public record CartDto
{
    public Guid Id { get; init; }
    public int ItemCount { get; init; }
    public decimal Subtotal { get; init; }
    public List<CartItemDto> Items { get; init; } = new();
}

public record CartItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal TotalPrice { get; init; }
}
