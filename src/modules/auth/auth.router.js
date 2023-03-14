import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as registerController from "./controller/registration.js";
import * as validators from './auth.validation.js'

const router = Router();
// signup
router.post("/signup", validation(validators.signup), registerController.signup);

//confirmEmail
router.get("/confirmEmail/:token", validation(validators.token), registerController.confirmEmail);

router.get("/requestRfToken/:token", registerController.requestRfToken);

//Signin
router.post("/signin", validation(validators.signin), registerController.signin);

router.post("/requestCode", registerController.sendCode)

router.post("/forgetPassword", registerController.forgetPassword)
export default router;
