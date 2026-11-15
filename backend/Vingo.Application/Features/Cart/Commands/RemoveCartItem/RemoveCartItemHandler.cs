using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Cart.Common;
using Vingo.Application.Features.Cart.Queries.GetCart;

namespace Vingo.Application.Features.Cart.Commands.RemoveCartItem;

public record RemoveCartItemCommand(
    Guid? UserId,
    string? SessionId,
    Guid ItemId
);

public class RemoveCartItemValidator : AbstractValidator<RemoveCartItemCommand>
{
    public RemoveCartItemValidator()
    {
        RuleFor(x => x.ItemId).NotEmpty().WithMessage("Cart item is required");
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.SessionId))
            .WithMessage("A cart requires a user or a guest session");
    }
}

public class RemoveCartItemHandler
{
    private readonly IApplicationDbContext _context;
    private readonly RemoveCartItemValidator _validator = new();

    public RemoveCartItemHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(RemoveCartItemCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var cart = await GetCartHandler.FindCartAsync(_context, command.UserId, command.SessionId, cancellationToken)
            ?? throw new KeyNotFoundException("Cart not found");

        var item = cart.Items.FirstOrDefault(i => i.Id == command.ItemId)
            ?? throw new KeyNotFoundException("Cart item not found");

        cart.RemoveItem(item.Id);
        await _context.SaveChangesAsync(cancellationToken);

        return await CartMapper.MapAsync(_context, cart, cancellationToken);
    }
}

public record ClearCartCommand(Guid? UserId, string? SessionId);

public class ClearCartHandler
{
    private readonly IApplicationDbContext _context;

    public ClearCartHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(ClearCartCommand command, CancellationToken cancellationToken = default)
    {
        var cart = await GetCartHandler.FindCartAsync(_context, command.UserId, command.SessionId, cancellationToken);

        if (cart != null)
        {
            cart.Clear();
            await _context.SaveChangesAsync(cancellationToken);
            return await CartMapper.MapAsync(_context, cart, cancellationToken);
        }

        return new CartDto { Id = Guid.Empty, ItemCount = 0, Subtotal = 0, Shipping = 0, Total = 0, Items = [] };
    }
}
