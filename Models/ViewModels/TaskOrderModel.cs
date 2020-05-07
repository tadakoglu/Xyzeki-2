using System;

namespace XYZToDo.Models.ViewModels
{
    public class TaskOrderModel
    {
        public long TaskId { get; set; } = 0; // Can be either QT or PT
        public int Order { get; set; } = 0;
    }
}
