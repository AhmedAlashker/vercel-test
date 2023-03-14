import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../../../../DB/model/User.model.js";
import { findOne, updateOne } from "../../../../DB/DBMethods.js";
import moment from "moment"
import { asyncHandler } from "../../../services/handelError.js";

export const SignOut = async (req, res) => {
    try {
        const _id = req.user._id
        await userModel.findOneAndUpdate(
            { _id, isOnline: true },
            { isOnline: false, lastSeen: moment().format() }
        );
        return res.status(200).json({ message: "Done" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server error" });
    }
};

export const profile = asyncHandler(
    async (req, res) => {
        const user = await userModel.findById(req.user._id)
        if (!user) {
            return next(new Error("Email Not Exist", { cause: 404 }));
        } else {
            return res.status(200).json({ message: "Done", user })
        }
    }

)

export const updatePassword = asyncHandler(
    async (req, res, next) => {
        const { oldPassword, newPassword } = req.body
        const user = await userModel.findById(req.user._id)
        const match = await bcrypt.compare(oldPassword, user.password)
        if (!match) {
            return next(new Error("In-valid login password", { cause: 409 }));
        } else {
            const hash = await bcrypt.hash(newPassword, parseInt(process.env.SALTROUND))
            const token = jwt.sign({ id: user._id, isLoggedIn: true }, process.env.tokenSignature, { expiresIn: 60 * 60 * 24, });
            await updateOne({ userModel, filter: { _id: user._id }, data: { password: hash } });
            return res.json({ message: "Done", token })
        }
    }
)
