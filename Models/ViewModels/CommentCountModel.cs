using System;

namespace XYZToDo.Models.ViewModels
{
    public class CommentCountModel
    {
        public long TaskId { get; set; } // quick or project task, TaskId
        public int CommentsCount { get; set; }
    }
}
