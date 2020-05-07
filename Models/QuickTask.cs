using System;
using System.Collections.Generic;

namespace XYZToDo.Models
{
    public partial class QuickTask
    {
        public QuickTask()
        {
            QuickTaskComment = new HashSet<QuickTaskComment>();
        }

        public long TaskId { get; set; }
        public string AssignedTo { get; set; }
        public string Owner { get; set; }
        public string TaskTitle { get; set; }
        public DateTimeOffset? Start { get; set; } 
        public DateTimeOffset? Date { get; set; }
        public string Completedby { get; set; }
        public DateTimeOffset? Finish { get; set; }
        public long? Order { get; set; }
        public bool? Archived { get; set; }
        public DateTimeOffset? ArchivedDate { get; set; }
        public string Status { get; set; }

        public Member AssignedToNavigation { get; set; }
        public Member OwnerNavigation { get; set; }
        public ICollection<QuickTaskComment> QuickTaskComment { get; set; }
    }
}
