export enum ErrorCodes {
    
        // ItemNotFoundError= 404,
        // MemberAlreadyExistsError= -2,   
        // OK = 200,
        // Created =201,
        // NoContent =204,
        // Unauthorized = 401,
        // Status503ServiceUnavailable = 503,
        // BadRequest = 400
        WrongCredentials=-4,
        ItemNotFoundError=-3,
        MemberAlreadyExistsError= -2,        
        DatabaseError = -1,       
        OK = 0 /* That means that there exists no error. */
       
}
