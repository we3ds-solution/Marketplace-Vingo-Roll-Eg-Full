using Vingo.Domain.Common;

namespace Vingo.Domain.Entities.Content;

public class InspirationSection : BaseEntity
{
    public Guid StoryId { get; private set; }
    public string? Heading { get; private set; }
    public string Body { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public int SortOrder { get; private set; }

    private InspirationSection() { } // EF Core

    public InspirationSection(Guid storyId, string body, string? heading, string? imageUrl, int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(body))
            throw new DomainException("Section body is required");

        StoryId = storyId;
        Body = body;
        Heading = heading;
        ImageUrl = imageUrl;
        SortOrder = sortOrder;
    }
}
