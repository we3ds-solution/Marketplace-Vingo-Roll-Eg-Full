namespace Vingo.Application.Common.Exceptions;

/// <summary>
/// Thrown when credentials are invalid or a session can't be resumed.
/// Mapped to a 401 response. Deliberately generic — no hints on which part failed.
/// </summary>
public class AuthFailedException : Exception
{
    public AuthFailedException(string message = "Invalid email or password")
        : base(message)
    {
    }
}
