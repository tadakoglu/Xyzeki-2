using System;


namespace XYZToDo.Infrastructure
{
    /* ReturnModel and ErrorCodes have been designed to reduce complexity in the Web API */
    public enum ErrorCodes
    {
        Forbidden = -6, // for 403
        LicenseBelongsToAnotherMember = -5,
        LicenseNotFoundError = -4,
        ItemNotFoundError = -3,
        MemberAlreadyExistsError = -2,
        DatabaseError = -1,
        OK = 0 /* That means that there exists no error. */

    }
}
