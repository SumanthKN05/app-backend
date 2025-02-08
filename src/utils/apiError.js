class ApiError extends Error{
  constructor(message, statusCode,errors=[],stack=""){
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    this.data=null;
    this.message=message;
    this.success=false;
    this.errors=errors;

  //there are many api errors some times so for structing api errors we use this
  if(stack){
    this.stack=stack;
} else{
    Error.captureStackTrace(this, this.constructor);
  }
}
}
export {ApiError}
