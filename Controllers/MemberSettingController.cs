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
    public class MemberSettingController : ControllerBase
    {
        IMemberSettingRepository iMemberSettingRepository;
        public MemberSettingController(IMemberSettingRepository iMemberSettingRepository)
        {
            this.iMemberSettingRepository = iMemberSettingRepository;
        }
        [HttpGet("MySetting")] // GET MemberSetting/MySetting
        public IActionResult MySetting()
        {
            var member = User.Identity.Name;
            MemberSetting mSetting = iMemberSettingRepository.GetMySetting(member);
            if (mSetting != null)
            {
                return Ok(mSetting);
            }
            return NotFound();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }
        [HttpPut("{username}")] // PUT /MemberSetting/tadakoglu + JSON Object
        public IActionResult UpdateSetting(string username, [FromBody]MemberSetting mSetting) //Accepts JSON body, not x-www-form-urlencoded!
        {
            if (mSetting == null || mSetting.Username != User.Identity.Name)
                return BadRequest();

            ReturnModel r = iMemberSettingRepository.UpdateMySetting(mSetting);

            if (r.ErrorCode == ErrorCodes.OK)
            {
                return NoContent();
            }
            else if (r.ErrorCode == ErrorCodes.ItemNotFoundError)
                return NotFound();
            else
                return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error.                
        }


    }
}