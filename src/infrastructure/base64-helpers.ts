export class Base64Handlers {
    FromBase64(strToDecode: string){  
        let binary:string = atob(strToDecode); // decoding, Convert Base64 string to a string(can be a binary string)
        return binary;
    }
    ToBase64String(strToEncode: string): string{ // string can be a binary string.
        //let strToEncode = '101010101'; //binary string to encode         
        let strBase64Encoded = btoa(strToEncode); // encoding, string to Base64       
        return strBase64Encoded;
    }
}
