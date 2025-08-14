using System.Collections.Generic;

namespace ManitasCreativas.Application.DTOs
{
    public class FeatureFlagsDto
    {
        public Dictionary<string, FeatureFlag> Features { get; set; } =
            new Dictionary<string, FeatureFlag>();
    }

    public class FeatureFlag
    {
        public bool Enabled { get; set; }
        public bool RequiresAdmin { get; set; }
        public string? Description { get; set; }
        public List<string> AllowedRoles { get; set; } = new List<string>();
    }
}
