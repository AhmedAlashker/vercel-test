import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { fileValidation, myMulter } from "../../services/multer.js";
import { endPoint } from "./car.endPoint.js";
import * as carController from './controller/car.js'

const router = Router()




router.post('/', auth(endPoint.addCar), myMulter(fileValidation.image).single('image'), carController.addCar)
router.put('/:id', auth(endPoint.updateCar), myMulter(fileValidation.image).single('image'), carController.updateCar)



export default router