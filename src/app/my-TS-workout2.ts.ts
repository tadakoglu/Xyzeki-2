
// import { Observable } from 'rxjs';
// import { HttpHeaders, HttpClient, HttpResponse } from '@angular/common/http';
// import { HttpParamsOptions, HttpParams } from '@angular/common/http/src/params';
// import { Member } from './model/member.model';

// export class MyTSWorkout2 {

//     /**
//      *
//      */
    
//     constructor(private http: HttpClient) { // private or public keyword makes http also a property! unless, it would be a local declaration.
//         // This is a test
//         let x: HttpResponse<Member>= new HttpResponse();
//         x.status // return number, status code
//         x.ok // return true or false based if status codes returned 2xxx
//         let ret: HttpHeaders  = x.headers;
//         let resBody:Member = x.body; // member object(response body) or null(nothing returned)
        
//     }
    
//     private static tokenx: string = "tesfft_oGnomv09pi93İGİ";
//     static MyMethod(){} //public as default. IN-class modifiers = public private protected static
//     TestMethod() : Observable<Object>{
//     let token: string = "test_oGnomv09pi93İGİ";
//     let authHeaderVal = `Bearer ${token}` // ` can be type with (CTLR + ALT + ,) combination in Q(Turkish) Keyboard
//     let headerJson = { "Content-Type":"application/json", "Authorization": authHeaderVal }
//     let header = new HttpHeaders(headerJson);
//     let paramsJson = {"id": "5", "category": "yeni"};
//     let x : HttpParamsOptions;
//     x.fromObject = {"id": "5", "x": "22"};
      
//     let params = new HttpParams(x);
  
//     let paramm = new HttpParams({
//       fromObject : {
//       ['email'] : "xx",
//         'password' : "xx"
//       }
//     });
//     let gotcha: object;
   
//     return this.http.get("https://www.xyzeki.com:5000",{ "headers": header, "observe":"response", "params": params, "responseType":"json" });
//    //.subscribe( response => gotcha = (response.body as Object)) işlemi repertuar içerisinde yapılarak nesne alınmış olur.
//   }


// }

// //indexable types ( they are similar to array )
// // [param: string] : string  means a sturcture such as  "birinci": "nedir", "ikinici": "istebu", "3": "budur"
// // supported index signatures: string and number, Typescript doesnt support boolean as index type!
// interface StringArray //this is an indexable type we assign a array-like types to it.
// {
//     [index: number]: string;
// }
// let simpleIndexible ={ "birinci": "nedir", "ikinici": "istebu", "3": "budur"};
 

//   let myArray: StringArray;
//   myArray = { [0] : 'birinci', [1] : 'ikinici'} // no need to do that.
//   myArray = { 0 : 'birinci', 1 : 'ikinici'} // no need to do that.
//   myArray = ["Bob", "Fred"];
  
//   interface StringArray2 {
//     [indexim: string]: string;
//   }
//   let str:StringArray2 = { ["birinci"]: "nedir", "ikinici": "istebu", ["son"]: "budur"}
//   let str2:StringArray2 = { "birinci": "nedir", "ikinici": "istebu", "3": "budur"}
//   str = str2;
//   let st3 = { ["birinci"]: "nedir", "ikinici": true, ["son"]: "budur"} // without interface
//   st3["birinci"] = "fd";
//   st3["ikinici"] = true; // cant't assign string or other types here.
// export class workoutService2{} //In-module(or namespace) modifiers: export

// namespace testNs{ // modules are same with namespace. includes classes/interfaces. they are obsolute and less used in favor of module keyword. namespace can be refered as "internal module" that includes only "not-export" classes
//   export class workoutService2{}
// }


