const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };











// we can use either this promise method or the try catch method 

/*
const asyncHandler = async(fn) => ()=>{
  try{
    await fn(req,res,next)
  } catch(error){
   res.status(err.code || 500).json({
   success: false,
   message: error.message || 'Server Error'})
    next(error)
  }
} 
 */

