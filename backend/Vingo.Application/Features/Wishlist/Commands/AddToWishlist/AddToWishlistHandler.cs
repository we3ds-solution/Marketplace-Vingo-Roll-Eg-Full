using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Wishlist.Common;
using Vingo.Domain.Entities.Shopping;

namespace Vingo.Application.Features.Wishlist.Commands.AddToWishlist;

public record AddToWishlistCommand(
    Guid? UserId,
    string? SessionId,
    string ProductSlug
);

public class AddToWishlistValidator : AbstractValidator<AddToWishlistCommand>
{
    public AddToWishlistValidator()
    {
        RuleFor(x => x.ProductSlug).NotEmpty().MaximumLength(200);
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.SessionId))
            .WithMessage("A wishlist requires a user or a guest session");
    }
}

public class AddToWishlistHandler
{
    private readonly IApplicationDbContext _context;
    private readonly AddToWishlistValidator _validator = new();

    public AddToWishlistHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistDto> Handle(AddToWishlistCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Slug == command.ProductSlug && p.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException($"Product '{command.ProductSlug}' not found");

        var wishlist = await WishlistMapper.FindAsync(_context, command.UserId, command.SessionId, cancellationToken);
        var isNew = false;

        if (wishlist == null)
        {
            wishlist = command.UserId.HasValue
                ? Domain.Entities.Shopping.Wishlist.CreateForUser(command.UserId.Value)
                : Domain.Entities.Shopping.Wishlist.CreateForGuest(command.SessionId!);
            isNew = true;
        }

        if (isNew)
        {
            _context.Wishlists.Add(wishlist);
        }

        wishlist.AddItem(product.Id);
        await _context.SaveChangesAsync(cancellationToken);

        return await WishlistMapper.MapAsync(_context, wishlist, cancellationToken);
    }
}
