import { create, findByIdAndUpdate, findOne } from "../../../../DB/DBMethods.js";
import carModel from "../../../../DB/model/car.model.js";
import cloudinary from "../../../services/cloudinary.js";
import { asyncHandler } from "../../../services/handelError.js";


export const addCar = asyncHandler(
    async (req, res, next) => {
        if (!req.file) {
            matchMedia
            return next(new Error('Image is Required', { cause: 400 }))
        } else {
            const { carMake, car_Model, } = req.body
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'car' })
            const result = await create({ model: carModel, data: { carMake, car_Model, image: secure_url, createdBy: req.user._id, imagePublicId: public_id } })
            return res.status(201).json({ message: "Done", result })
        }
    }
)
export const updateCar = asyncHandler(
    async (req, res, next) => {
        const { id } = req.params
        const car = await findOne({ model: carModel, filter: { _id: id } })
        if (!car) {
            return next(new Error("In-valid car ID"), { cause: 404 })
        } else {
            if (req.file) {
                const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: 'car' })
                req.body.image = secure_url
                req.body.imagePublicId = public_id
            }
            req.body.updatedBy = req.user._id
            const result = await findByIdAndUpdate({ model: carModel, filter: id, data: req.body, options: { new: false } })
            if (!result) {
                await cloudinary.uploader.destroy(req.body.imagePublicId)
                return next(new Error('in-valid CAr ID', { cause: 400 }))
            } else {
                await cloudinary.uploader.destroy(result.imagePublicId)
                return res.status(201).json({ message: "Done", result })
            }
        }
    }
)
