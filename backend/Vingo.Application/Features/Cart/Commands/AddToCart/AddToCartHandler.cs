using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Cart.Common;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Application.Features.Cart.Commands.AddToCart;

public class AddToCartHandler
{
    private readonly IApplicationDbContext _context;
    private readonly AddToCartValidator _validator = new();

    public AddToCartHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(AddToCartCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        // Find or create cart
        Domain.Entities.Shopping.Cart cart;
        var isNewCart = false;

        if (command.UserId.HasValue)
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == command.UserId.Value, cancellationToken);

            if (cart == null)
            {
                cart = Domain.Entities.Shopping.Cart.CreateForUser(command.UserId.Value);
                isNewCart = true;
            }
        }
        else
        {
            cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.SessionId == command.SessionId, cancellationToken);

            if (cart == null)
            {
                cart = Domain.Entities.Shopping.Cart.CreateForGuest(command.SessionId!);
                isNewCart = true;
            }
        }

        if (isNewCart)
        {
            _context.Carts.Add(cart);
        }

        // Get product and calculate price (server-side — never trust the client)
        var product = await _context.Products
            .Include(p => p.Materials)
            .Include(p => p.Sizes)
            .Include(p => p.Colors)
            .FirstOrDefaultAsync(p => p.Id == command.ProductId && p.IsActive, cancellationToken);

        if (product == null)
            throw new KeyNotFoundException($"Product {command.ProductId} not found");

        if (command.SizeId.HasValue &&
            product.Sizes.Any() &&
            product.Sizes.All(s => s.Id != command.SizeId.Value))
        {
            throw new ArgumentException("The selected size is not available for this product");
        }

        if (command.MaterialId.HasValue &&
            product.Materials.Any() &&
            product.Materials.All(m => m.Id != command.MaterialId.Value))
        {
            throw new ArgumentException("The selected material is not available for this product");
        }

        // Quick add: resolve default options (first by sort order) when the
        // client doesn't pick them — matches the storefront's default view.
        var materialId = command.MaterialId ?? product.Materials.OrderBy(m => m.SortOrder).FirstOrDefault()?.Id;
        var sizeId = command.SizeId ?? product.Sizes.OrderBy(s => s.SortOrder).FirstOrDefault()?.Id;
        var colorId = command.ColorId ?? product.Colors.OrderBy(c => c.SortOrder).FirstOrDefault()?.Id;

        var unitPrice = product.CalculateFinalPrice(materialId, sizeId);

        var cartItem = new CartItem(
            cart.Id,
            command.ProductId,
            command.Quantity,
            unitPrice.Amount,
            materialId,
            colorId,
            sizeId,
            command.Mount,
            command.WidthInches,
            command.HeightInches
        );

        cart.AddItem(cartItem);

        await _context.SaveChangesAsync(cancellationToken);

        return await CartMapper.MapAsync(_context, cart, cancellationToken);
    }
}
