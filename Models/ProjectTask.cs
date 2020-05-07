using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class ProjectTask
    {
        public ProjectTask()
        {
            ProjectTaskComment = new HashSet<ProjectTaskComment>();
        }

        public long TaskId { get; set; }
        public long ProjectId { get; set; }
        public string AssignedTo { get; set; }
        public string TaskTitle { get; set; }
        public string TaskDescription { get; set; }
        public DateTimeOffset? Start { get; set; }
        public DateTimeOffset? Deadline { get; set; }
        public DateTimeOffset? Finish { get; set; }
        public bool IsCompleted { get; set; }
        public long? Order { get; set; }
        public bool? Archived { get; set; }
        public int Zindex { get; set; }
        public bool? ShowSubTasks { get; set; }
        public string Status { get; set; }

        public Member AssignedToNavigation { get; set; }
        public Project Project { get; set; }
        public ICollection<ProjectTaskComment> ProjectTaskComment { get; set; }
    }
}
