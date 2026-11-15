using FluentValidation.Results;

namespace Vingo.Application.Common.Exceptions;

/// <summary>
/// Thrown when a command fails FluentValidation. The API layer maps this
/// to a 400 response with a field-level error dictionary.
/// </summary>
public class ValidationException : Exception
{
    public Dictionary<string, string[]> Errors { get; }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : base("One or more validation errors occurred")
    {
        Errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());
    }
}
