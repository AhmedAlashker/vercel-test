// import asyncHandler from "express-async-handler";

export function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      return next(new Error(err.message, { cause: 500 }));
    });
  };
}


export const globalError=  (err, req, res, next) =>{
    if (err) {
        if (process.env.MOOD === "DEV") {
            return res.status(err['cause']).json({message: err.message , status: err['cause'], stack: err.stack})
        } else {
            return res.status(err['cause']).json({message: err.message , status: err['cause']})
        }
    }
}