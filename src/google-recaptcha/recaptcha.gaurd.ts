import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from "@nestjs/common";
  
  @Injectable()
  export class RecaptchaGuard implements CanActivate {
    constructor() {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const { body } = context.switchToHttp().getRequest();
  
      let data: any = await new Promise((resolve, reject) => {
        fetch(
            `https://www.google.com/recaptcha/api/siteverify?response=${body.recaptchaValue}&secret=${process.env.RECAPTCHA_SECRET}`
          , { 
              method: 'POST'
          }).then(res => res.json()).then(res => {
            resolve(res);
          })
      })    
      
      if (!data.success) {
        throw new ForbiddenException();
      }
      return true;
    }
  }