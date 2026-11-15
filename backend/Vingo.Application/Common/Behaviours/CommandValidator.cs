using FluentValidation;

namespace Vingo.Application.Common.Behaviours;

/// <summary>
/// Small helper so handlers can validate their commands without MediatR.
/// </summary>
public static class CommandValidator
{
    public static async Task ValidateAsync<T>(T command, IValidator<T> validator, CancellationToken cancellationToken = default)
    {
        var result = await validator.ValidateAsync(command, cancellationToken);
        if (!result.IsValid)
        {
            throw new Exceptions.ValidationException(result.Errors);
        }
    }
}
