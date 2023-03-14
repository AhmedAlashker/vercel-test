import userModel from "./../../../../DB/model/User.model.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../../../services/email.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "./../../../services/handelError.js";
import { findOne, updateOne } from "../../../../DB/DBMethods.js";

//  -------------------------------- SignUp ---------------------------------------

export const signup = asyncHandler(
  async (req, res, next) => {
    const { userName, email, password, phone } = req.body;
    const user = await findOne({ model: userModel, filter: { email }, select: email });
    if (user) {
      // res.status(409).json({ message: "Email Exist" });
      return next(new Error("Email Exist", { cause: 409 }));
    } else {
      const hash = bcrypt.hashSync(password, parseInt(process.env.SALTROUND));
      const newUser = new userModel({ userName, email, phone, password: hash });

      const token = jwt.sign({ id: newUser._id }, process.env.emailToken, { expiresIn: "2h", })
      const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
      const rfToken = jwt.sign({ id: newUser._id }, process.env.emailToken);
      const rfLink = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/requestRfToken/${rfToken}`;
      const message = `
        <a href='${link}'>ConfirmEmail</a> <br>
        <a href='${rfLink}'>Request new link Confirmation Email</a>
        `;

      const emailResult = await sendEmail(email, "Confirm-Email", message);
      if (emailResult.accepted.length) {
        await newUser.save();
        return res.status(201).json({ message: "Done", userId: newUser._id, link });
      } else {
        return next(new Error("Rejected email", { cause: 400 }));
        // res.status(400).json({ message: "please provide real email" });
      }
    }
  });

//  -------------------------------- refreshEmailToken ---------------------------------------

export const requestRfToken = asyncHandler(
  async (req, res) => {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.emailToken);
    if (!decoded?.id) {
      return next(new Error("in-valid Payload", { cause: 400 }));
    } else {
      const user = await userModel.findById(decoded.id);
      if (user?.confirmEmail) {
        return res.json({ message: "Already confirmed " });
      } else {
        const token = jwt.sign({ id: user._id }, process.env.emailToken, { expiresIn: 60 * 2 })
        const link = `${req.protocol}://${req.headers.host}${process.env.BASEURL}/auth/confirmEmail/${token}`;
        const message = `
        <a href='${link}'>Follow me to confirm Your account</a>
        `;
        sendEmail(user.email, "Confirm-Email", message);
        return res.json({ message: "Done" });
      }
    }
  }
)
//  -------------------------------- confirmEmail ---------------------------------------

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.emailToken);
  if (!decoded?.id) {
    // res.status(400).send("in-valid Payload");
    return next(new Error("in-valid Payload", { cause: 400 }));
  } else {
    await updateOne({ userModel, filter: { _id: decoded.id, confirmEmail: false }, data: { confirmEmail: true } });
    return res.status(200).json({ message: "Email confirmed please login" })
    // res.redirect();
  }
});

//  -------------------------------- SignIn ---------------------------------------
export const signin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findOne({ model: userModel, filter: { email }, });
  if (!user) {
    // res.status(404).json({ message: "Email Not Exist" });
    return next(new Error("Email Not Exist", { cause: 404 }));
  } else {
    if (!user.confirmEmail) {
      return next(new Error("Confirm your email first", { cause: 400 }));
    } else {
      if (user.blocked) {
        return next(new Error("Blocked User", { cause: 400 }));
      } else {
        const compare = bcrypt.compareSync(password, user.password);
        if (!compare) {
          return next(new Error("In-valid Password", { cause: 400 }));
        } else {
          const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.tokenSignature, { expiresIn: 60 * 60 * 24, });
          await userModel.findOneAndUpdate({ email }, { isOnline: true })
          return res.status(200).json({ message: "Done", token });
        }
      }
    }
  }
});


export const sendCode = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findOne({ model: userModel, filter: { email }, });
  if (user?.isDeleted || user?.blocked) {
    return next(new Error("Can not send code to not register account or blocked"))
  } else {
    const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000)
    // await userModel.updateOne({ _id: user._id }, { code })
    await updateOne({ userModel, filter: { _id: user._id }, data: { code } });
    sendEmail(user.email,
      'forget password', `<h1> Plz Use this code : ${code} to reset your Password </h1>`)
    return res.json({ message: "Done" });
  }
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await findOne({ model: userModel, filter: { email }, });
  if (!user) {
    return next(new Error("Email Not Exist", { cause: 404 }));
  } else {
    if (user.code != code) {
      return next(new Error("In-valid Code", { cause: 400 }));
    } else {
      const hashPassword = await bcrypt.hash(password, parseInt(process.env.SALTROUND))
      await updateOne({ userModel, filter: { _id: user._id }, data: { password: hashPassword, code: null } });
      return res.status(200).json({ message: "Done" })
    }
  }
});