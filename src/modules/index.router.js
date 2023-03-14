import express from 'express'
import morgan from 'morgan'
import connectDB from '../../DB/connection.js'
import { globalError } from '../services/handelError.js'
import authRouter from './auth/auth.router.js'
import carRouter from './car/car.router.js'
import reviewsRouter from './reviews/reviews.router.js'
import userRouter from './user/user.router.js'



export const appRouter = (app) => {
    
    //convert Buffer Data
    app.use(express.json())
    // setup morgan MOOD
    if (process.env.MOOD === "DEV") {
        app.use(morgan("dev"));
    } else {
        app.use(morgan('common'))
    }
    //Base URL
    const baseUrl = process.env.BASEURL
    //Setup API Routing 
    app.use(`${baseUrl}/auth`, authRouter)
    app.use(`${baseUrl}/user`, userRouter)
    app.use(`${baseUrl}/car`, carRouter)
    app.use(`${baseUrl}/reviews`, reviewsRouter)

    // in-valid page
    app.use('*', (req, res, next) => {
        // res.send("In-valid Routing Plz check url  or  method")
        next(new Error("In-valid Routing Plz check url  or  method", { cause: 404 }));
    })

    // global handling Error
    app.use(globalError);
//connection DB
    connectDB()
}





// export {
//     authRouter,
//     carRouter,
//     reviewsRouter,
//     userRouter
// }