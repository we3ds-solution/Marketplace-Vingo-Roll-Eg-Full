using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Cart.Common;
using Vingo.Application.Features.Cart.Queries.GetCart;

namespace Vingo.Application.Features.Cart.Commands.UpdateCartItem;

public record UpdateCartItemCommand(
    Guid? UserId,
    string? SessionId,
    Guid ItemId,
    int Quantity
);

public class UpdateCartItemValidator : AbstractValidator<UpdateCartItemCommand>
{
    public UpdateCartItemValidator()
    {
        RuleFor(x => x.ItemId).NotEmpty().WithMessage("Cart item is required");
        RuleFor(x => x.Quantity).InclusiveBetween(0, 20).WithMessage("Quantity must be between 0 and 20");
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.SessionId))
            .WithMessage("A cart requires a user or a guest session");
    }
}

public class UpdateCartItemHandler
{
    private readonly IApplicationDbContext _context;
    private readonly UpdateCartItemValidator _validator = new();

    public UpdateCartItemHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CartDto> Handle(UpdateCartItemCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var cart = await GetCartHandler.FindCartAsync(_context, command.UserId, command.SessionId, cancellationToken)
            ?? throw new KeyNotFoundException("Cart not found");

        var item = cart.Items.FirstOrDefault(i => i.Id == command.ItemId)
            ?? throw new KeyNotFoundException("Cart item not found");

        if (command.Quantity == 0)
        {
            cart.RemoveItem(item.Id);
        }
        else
        {
            cart.UpdateItemQuantity(item.Id, command.Quantity);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await CartMapper.MapAsync(_context, cart, cancellationToken);
    }
}
