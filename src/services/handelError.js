// import asyncHandler from "express-async-handler";

export function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      //   res
      //     .status(500)
      //     .json({ message: "Catch error", err: err.message, stack: err.stack });
      next(new Error(err.message, { cause: 500 }));
    });
  };
}


export const globalError=  (err, req, res, next) =>{
    if (err) {
        if (process.env.MOOD === "DEV") {
            res.status(err['cause']).json({message: err.message , status: err['cause'], stack: err.stack})
        } else {
            res.status(err['cause']).json({message: err.message , status: err['cause']})
        }
    }
}