import { Injectable } from '@angular/core';

@Injectable()
export class CryptoHelpersService {

  constructor() { }

  encryptWithAES(authorizationKey: string): string {
    try {
      var crypto = require('crypto');
      var key = '14530000000001234000000800001993'; //replace with your key
      var iv = '1453001234001993'; //replace with your IV
      var cipher = crypto.createCipheriv('aes256', key, iv)
      var crypted = cipher.update(authorizationKey, 'utf8', 'base64')
      crypted += cipher.final('base64');
      console.log(crypted);
      return crypted;
    } catch (error) {
      return null;
    }

  }
}
