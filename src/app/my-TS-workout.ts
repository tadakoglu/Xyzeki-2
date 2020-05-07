// //import { Component, OnInit } from '@angular/core';
// let greeting : string = "Hello World!";
// var testim = { "ahmet":{"x":2, "y":3}}; //let's say this ts file includes one export or import keyword. so this makes .ts file a ts module. then a variable, field, class, func etc. cannot be reached in another module unless it's exported. if this file is not a module(doesnt include any import/export keywords, then this varible can be reached in another modules' funcs/constructors  easily because it is in global scope)

// let greeting2 : string = "Hello World!"; //top-level export
// var ss = "dfd";
// //var l = new dfdfdfd(); // compile time error !! because of , you cant use a class before declaration.
// class dfdfdfd {
//     /**
//      *
//      */
// dateOperations(){
//     //toString converts to locale
//     //toISOString convert to UTC = UTC+00:00 = GMT time zone, ISO 8601
//     var T1 = new Date('1900-01-01 12:10:20 UTC'); // GMT time zone = UTC+00:00 = UTC " " are all same, we use ISO 8601
//     var T12 = new Date('1900-01-01 12:10:20 UTC+02:00'); // GMT time zone = UTC+00:00 = UTC " " are all same, we use ISO 8601
//     var T13 = new Date('1900-01-01 12:10:20 GMT'); // GMT time zone = UTC+00:00 = UTC " " are all same, we use ISO 8601
//     //T1 T12 T13 ARE ALL SAME
//     var ob1 = T1.toISOString(); // doesn't change anything, they are already in ISO format(GMT=UTC+00:00 = " ")
//     console.log("ISO 8601: GMT= UTC0" + ob1);

//     var today:Date = new Date(Date.now())
//     let todayNice:Date = new Date()
//     let utc0ISO:string = todayNice.toISOString();
//     console.log(utc0ISO);

//     let t: string = todayNice.toString();  
//     console.log(t)
// }
    
//     constructor() { var kllmm  = new kkk.klm(); //OK even using new before kkk.klm declaration.
//     }

//     testimFonk(){
//         var kllmmAA  = new kkk.klm(); //OK even using new before kkk.klm declaration.
//     }
        
    
//     //export var greeting2 : string = "Hello World!";  /// WRONT PLACE FOR EXPORT KEYWORD. 
// }

// var l = new dfdfdfd(); //OK you HAVE TO USE A CLASS AFTER DECLARATION
// var fonkVAR = myfonk(); //ok, YOU CAN USE A FUNC CALL, VARIABLE, PROPERTY BEFORE IT'S DECLARATION... BUT CANNOT USE CLASS EVEN CLASSES IN A MODULE OR NAMESPACE BEFORE DECLARATION!!
// function myfonk(){
//     var kllmmAA  = new kkk.klm(); //OK even using new before kkk.klm declaration. this is NOT İN GLOBAL SCOPE, THE REASON WHY IT'S OKAY.

// }

// //NOTE WE CAN REFERENCE NAMESPACE/MODULE CLASSES EVEN BEFORE THEİR DECLARATION IN LOCAL-SCOPES... NOT IN GLOBAL SCOPE !!
// //export var greeting3 : string = "Hello World!";
// //EXPORT KEYWORDS must be on TOP-LEVEL elements (top level elements are the ones that doesnt take place in(or it's said to be on also) any function, class etc.)
// /* önemli not: bir .ts dosyasında sadece bir adet import veya export keywordü bulunması
// tüm bu dosya içerisindeki fonksiyonları, fieldları değişkenleri global scopeden çıkarır.
// yani diğer .ts dosyaları içerisindeki fonksiyonlarda(veya constructor) ulaşılmaz olur.

// bu durumda ilgili .ts import edilmek zorundadır ki içerisindeki değişken fonk. sınıf vb.lerine ulaşım sağlanabilsin.
// */
// // we can reach any exported toplevel field/func/class/namespace in the same ts file.

// //var k = new xyz.abc(); //COMPILE TIME ERROR!you cant use new xyz.abc before namespace declaration.
// //think of this namespace creation of a another module in another file.
//  export namespace xyz{ //this export itself keyword transformed this ts file a module. that means that have to be imported to be used ! think of this namespace as  another ts file(say this a module file)
//           export class abc{ // you can reach this class in another module importing our xyz namespace
//             /**
//              *
//              */
//             constructor() {
//                 var xzv = new kkk.klm(); // ok
                
//             }
//     }
//     let testFi: string; // you can't reach this both in this module and! in another module importing our xyz namespace import { xyz } from './fgfgf'; you have to use export to use it even in here .namespace content aparted with namespace keyword from this file.

// }

// var k = new xyz.abc(); // OK.
// //var no = new xyz.testFi(); //compile-time error! 

// //var alm  = new kkk.klm(); // compile time error you cant decalre before module or namespace declaration. !!
// //BECAUSE THIS IS GLOBAL SCOPE. var k; module kkk are ALL SAME AND GLOBAL-LEVEL declarations. earlier code are run first by compiler.
// module kkk{ //module is same as namespace and included in ts module. when a import or export found here.

//     let abcc: number; // this is not allowed in c#, c# namespaces only include class and interface or namespace...
//     export class klm{ // module is same as namespace

//     }
// }

// let abc = (ahmet: number) => { let a: number  = 5;}
// abc(5)
// var alm  = new kkk.klm(); // OK !!

// //there is a difference with c#, in c# global scope can include only namespace, class or interface 
// //global scope(or i.e. namespace) cannot include fields, methods...
// // typescript is a little more elastic than c#
// //typescript can include methods and fields in global namespace besides namespace, class and interface