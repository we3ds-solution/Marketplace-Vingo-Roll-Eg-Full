using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Vingo.Application.Common.Behaviours;
using Vingo.Application.Common.Interfaces;
using Vingo.Application.Features.Wishlist.Common;

namespace Vingo.Application.Features.Wishlist.Commands.RemoveFromWishlist;

public record RemoveFromWishlistCommand(
    Guid? UserId,
    string? SessionId,
    string ProductSlug
);

public class RemoveFromWishlistValidator : AbstractValidator<RemoveFromWishlistCommand>
{
    public RemoveFromWishlistValidator()
    {
        RuleFor(x => x.ProductSlug).NotEmpty().MaximumLength(200);
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.SessionId))
            .WithMessage("A wishlist requires a user or a guest session");
    }
}

public class RemoveFromWishlistHandler
{
    private readonly IApplicationDbContext _context;
    private readonly RemoveFromWishlistValidator _validator = new();

    public RemoveFromWishlistHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistDto?> Handle(RemoveFromWishlistCommand command, CancellationToken cancellationToken = default)
    {
        await CommandValidator.ValidateAsync(command, _validator, cancellationToken);

        var wishlist = await WishlistMapper.FindAsync(_context, command.UserId, command.SessionId, cancellationToken);

        if (wishlist == null)
        {
            return new WishlistDto { Count = 0, Items = [] };
        }

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Slug == command.ProductSlug, cancellationToken);

        if (product != null)
        {
            wishlist.RemoveItem(product.Id);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return await WishlistMapper.MapAsync(_context, wishlist, cancellationToken);
    }
}

public class GetWishlistHandler
{
    private readonly IApplicationDbContext _context;

    public GetWishlistHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistDto> Handle(
        Guid? userId,
        string? sessionId,
        CancellationToken cancellationToken = default)
    {
        var wishlist = await WishlistMapper.FindAsync(_context, userId, sessionId, cancellationToken);

        if (wishlist == null)
        {
            return new WishlistDto { Count = 0, Items = [] };
        }

        return await WishlistMapper.MapAsync(_context, wishlist, cancellationToken);
    }
}

public record ClearWishlistCommand(Guid? UserId, string? SessionId);

public class ClearWishlistHandler
{
    private readonly IApplicationDbContext _context;

    public ClearWishlistHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistDto> Handle(ClearWishlistCommand command, CancellationToken cancellationToken = default)
    {
        var wishlist = await WishlistMapper.FindAsync(_context, command.UserId, command.SessionId, cancellationToken);

        if (wishlist != null)
        {
            wishlist.Clear();
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new WishlistDto { Count = 0, Items = [] };
    }
}
