using Microsoft.AspNetCore.Identity;

namespace Vingo.Infrastructure.Identity;

public class VingoUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;
}
