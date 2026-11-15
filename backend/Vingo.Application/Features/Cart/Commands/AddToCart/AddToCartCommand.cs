using FluentValidation;

namespace Vingo.Application.Features.Cart.Commands.AddToCart;

public record AddToCartCommand(
    Guid? UserId,
    string? SessionId,
    Guid ProductId,
    int Quantity,
    Guid? MaterialId = null,
    Guid? ColorId = null,
    Guid? SizeId = null,
    string? Mount = null,
    decimal? WidthInches = null,
    decimal? HeightInches = null
);

public class AddToCartValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty().WithMessage("Product is required");
        RuleFor(x => x.Quantity).InclusiveBetween(1, 20).WithMessage("Quantity must be between 1 and 20");
        RuleFor(x => x.Mount)
            .Must(m => m == null || m == "inside" || m == "outside")
            .WithMessage("Mount must be 'inside' or 'outside'");
        RuleFor(x => x)
            .Must(x => x.UserId != null || !string.IsNullOrWhiteSpace(x.SessionId))
            .WithMessage("A cart requires a user or a guest session");
    }
}
