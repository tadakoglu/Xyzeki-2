import { ErrorCodes } from 'src/infrastructure/error-codes.enum';

export class ReturnModel<T> { 
    constructor(
        public ErrorCode?: ErrorCodes,
        public Model?: T) {}
        
    
}
