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
    public class MemberLicenseController : ControllerBase
    {
        IMemberLicenseRepository iMemberLicenseRepository;
        public MemberLicenseController(IMemberLicenseRepository iMemberLicenseRepository)
        {
            this.iMemberLicenseRepository = iMemberLicenseRepository;
        }

        [HttpGet("AccessGranted")] // GET MemberLicense/AccessGranted
        public IActionResult AccessGranted() //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT

            bool grantAccess = iMemberLicenseRepository.AccessGranted(member);
            if (grantAccess)
            {
                return Ok(true);
            }
            else
            {
                return Ok(false);
            }
        }
        [HttpGet("PrimaryAccessGranted")] // GET MemberLicense/PrimaryAccessGranted
        public IActionResult PrimaryAccessGranted() //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT

            bool grantAccess = iMemberLicenseRepository.PrimaryAccessGranted(member);
            if (grantAccess)
            {
                return Ok(true);
            }
            else
            {
                return Ok(false);
            }
        }


        [HttpGet("AllLicenses")] // GET MemberLicense/AllLicenses
        [Authorize(Roles = "Manager")]
        public IActionResult AllLicenses() //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            MemberLicense[] all = iMemberLicenseRepository.AllLicenses();
            if (all != null)
            {
                return Ok(all);
            }
            return NotFound();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        [HttpPost()] // POST /MemberLicense + JSON Object
        [Authorize(Roles = "Manager")]
        public IActionResult NewLicense([FromBody]MemberLicense memberLicense) //Accepts JSON body, not x-www-form-urlencoded!
        {
            ReturnModel newLic = iMemberLicenseRepository.NewLicense(memberLicense);
            if (newLic.ErrorCode == ErrorCodes.OK)
            {
                return CreatedAtAction(null, null, (Guid)newLic.Model); // 201 Created
            }
            return new StatusCodeResult(StatusCodes.Status503ServiceUnavailable);  // 503 Service Unavailable Error. 

        }


        [HttpDelete("{licenseId}")] // DELETE MemberLicense/1
        [Authorize(Roles = "Manager")]
        public IActionResult DeleteLicense([FromRoute]string licenseId) //[FromRoute] is optional, it already accepts from route parameters but don't accepts JSON.
        {
            MemberLicense mLic = iMemberLicenseRepository.DeleteLicense(Guid.Parse(licenseId));
            if (mLic != null)
            {
                return Ok(mLic); // or use No Content without arguments returned.
            }
            return NotFound();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     

        }




        [HttpGet("MyLicense")] // GET MemberLicense/MyLicense
        public IActionResult MyLicense() //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT

            MemberLicense myLicense = iMemberLicenseRepository.MyLicense(member);
            if (myLicense != null)
            {
                return Ok(myLicense);
            }
            return NotFound();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }


        [HttpGet("{licenseId}/UsedStorage")] // GET MemberLicense/UsedStorage
        public IActionResult GetUsedStorage([FromRoute]string licenseId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        {
            var member = User.Identity.Name; // For security. From Claim(ClaimTypes.Name, Username) in JWT

            MemberLicenseUsedStorage mlus = iMemberLicenseRepository.GetUsedStorage(Guid.Parse(licenseId));
            if (mlus != null)
            {
                return Ok(mlus);
            }
            return NotFound();  // 404 resource not found, Microsoft docs use NotFound for this kind of behavior.     
        }

        // [HttpPut("{licenseId}/Update")] // GET MemberLicense/3434/Update
        // public IActionResult UpdateUsedStorage([FromRoute]string licenseId) //Accepts from route parameters not JSON. You don't have to speficy [FromRoute], but you can..
        // {
        //     MemberLicenseUsedStorage mlus = iMemberLicenseRepository.GetUsedStorage(Guid.Parse(licenseId));
        //     mlus.AzureSaUsedSizeInBytes = 123456789;
        //     iMemberLicenseRepository.UpdateUsedStorage(mlus);
        //     return Ok(mlus);  
        // }

    }
}