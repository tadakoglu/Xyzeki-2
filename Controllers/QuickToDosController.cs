using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using XYZToDo.Infrastructure;
using XYZToDo.Infrastructure.Abstract;
using XYZToDo.Models.Abstract;
using XYZToDo.Models.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using XYZToDo.Models;

namespace XYZToDo.Controllers
{

    [Authorize()]
    [Route("api/[controller]")]
    public class QuickToDosController : ControllerBase
    {
        IQuickTodoRepository IQuickTodoRepository;
        public QuickToDosController(IQuickTodoRepository iQuickTodoRepository)
        {
            this.IQuickTodoRepository = iQuickTodoRepository;

        }
        // GET api/QuickToDos/My
        [HttpGet("My/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")]
        public IActionResult MyQuickTodos(int pageNo = 1, string searchValue = "undefined", int pageSize = 50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            QuickTask[] quickTodos = IQuickTodoRepository.MyQuickTodos(member, pageNo, searchValue, pageSize); //Owner

            if (quickTodos != null)
            {
                return Ok(quickTodos);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }
        // GET api/QuickToDos/AssignedToMe
        [HttpGet("AssignedToMe/Search/{searchValue}")]
        public IActionResult AssignedToMe(string searchValue = "undefined") //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            QuickTask[] quickTodos = IQuickTodoRepository.AssignedToMe(member, searchValue); //AssignedTo

            if (quickTodos != null)
            {
                return Ok(quickTodos);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.
        }

        [HttpGet("MyAndAssignedToMe/CommentsCount/Page/{pageNo}/Search/{searchValue}/PageSize/{pageSize}")] // GET api/QuickToDos/MyAndAssignedToMe/CommentsCount
        public IActionResult GetQuickToDoCommentsCount(int pageNo = 1, string searchValue = "undefined", int pageSize = 50) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            CommentCountModel[] qtcCount = this.IQuickTodoRepository.GetQuickTodoCommentsCount(member, pageNo, searchValue, pageSize);
            if (qtcCount != null)
                return Ok(qtcCount);
            else
                return NoContent();
        }

        [HttpPost("TOMs")] // POST /QuickToDos/TOMs + JSON Object
        public IActionResult SaveAllTOMs([FromBody]TaskOrderModel[] TOMs) //Accepts JSON body, not x-www-form-urlencoded!
        {
            ReturnModel results = IQuickTodoRepository.SaveAllTOMs(TOMs);
            if (results.ErrorCode == ErrorCodes.OK)
            {
                return Ok(true);
            }
            return Ok(false);
        }


        [HttpPost()] // POST /api/QuickToDos + JSON Object
        public IActionResult NewQuickTodo([FromBody]QuickTask quickTask) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (quickTask == null)
                return BadRequest();

            quickTask.Owner = User.Identity.Name;
            ReturnModel newQuickTodo = IQuickTodoRepository.NewQuickTodo(quickTask);
            if (newQuickTodo.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(null, null, newQuickTodo.ReturnedId); // 201 Created
            }

            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 
        }

        [HttpPut("{taskId}")] // PUT QuickToDos/3 + JSON Object
        public IActionResult UpdateQuickTodo([FromRoute]long taskId, [FromBody]QuickTask quickToDo)
        {
            if (quickToDo == null || taskId != quickToDo.TaskId)
            {
                return BadRequest(); // 400 Bad Request
            }
            ReturnModel r = IQuickTodoRepository.UpdateQuickTodo(quickToDo);
            if (r.ErrorCode == ErrorCodes.OK)
            {
                return NoContent(); //204 No Content
            }
            else if (r.ErrorCode == ErrorCodes.ItemNotFoundError)
            {
                return BadRequest();
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }

        [HttpDelete("{taskId}")] // DELETE QuickToDos/1
        public IActionResult DeleteQuickTodo([FromRoute]long taskId) //[FromRoute] is optional, it already accepts from route parameters not JSON.
        {
            QuickTask quickToDo = IQuickTodoRepository.DeleteQuickTodo(taskId);
            if (quickToDo != null)
            {
                return Ok(quickToDo); // or use No Content without arguments returned.
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     

        }

        [HttpGet("{toDoId}")] // GET QuickToDos/1
        public IActionResult FindQuickToDo(long toDoId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            QuickTask quickToDo = IQuickTodoRepository.FindQuickToDo(toDoId);
            if (quickToDo != null)
            {
                return Ok(quickToDo);
            }
            return NoContent();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPut("Complete/{quickTaskId}")]  // PUT /api/QuickToDos/Complete/2
        public IActionResult Complete([FromRoute] long quickTaskId)
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT
            if (quickTaskId == 0)
            {
                return BadRequest(); // 400 Bad Request
            }
            QuickTask quickTodo = IQuickTodoRepository.Complete(quickTaskId, member);
            if (quickTodo != null)
            {
                return Ok(quickTodo);
            }
            else
            {
                return NoContent();
            }

        }
        [HttpPut("DeComplete/{quickTaskId}")]  // PUT /api/QuickToDos/DeComplete/2
        public IActionResult DeComplete([FromRoute] long quickTaskId)
        {
            if (quickTaskId == 0)
            {
                return BadRequest(); // 400 Bad Request
            }

            QuickTask quickTodo = IQuickTodoRepository.DeComplete(quickTaskId);
            if (quickTodo != null)
            {
                return Ok(quickTodo);
            }
            else
            {
                return NoContent();
            }

        }
    }

}