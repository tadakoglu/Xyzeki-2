using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class Project
    {
        public Project()
        {
            ProjectTask = new HashSet<ProjectTask>();
        }

        public long ProjectId { get; set; }
        public int Privacy { get; set; }
        public string Owner { get; set; }
        public string ProjectManager { get; set; }
        public string ProjectName { get; set; }
        public decimal CompletionRate { get; set; }
        public string Color { get; set; }
        public long? Order { get; set; }

        public Member OwnerNavigation { get; set; }
        public Member ProjectManagerNavigation { get; set; }
        public ICollection<ProjectTask> ProjectTask { get; set; }
    }
}
