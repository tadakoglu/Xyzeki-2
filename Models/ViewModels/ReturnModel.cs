using System;
using XYZToDo.Infrastructure;

namespace XYZToDo.Models.ViewModels
{
    /* ReturnModel and ErrorCodes have been designed to reduce complexity in the Web API */
    public class ReturnModel 
    {
        public ErrorCodes ErrorCode {get; set;}=ErrorCodes.OK; // There exist no errors by default. Don't change this settings.
        public long ReturnedId { get; set; } = 0; // 0 as default
        public object Model{get; set; } 
    }
}
