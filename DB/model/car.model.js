import { Schema, model, Types } from "mongoose";


const carSchema = new Schema({

    carMake: {
        type: String,
        required: [true, 'model is required'],
        lowercase: true
    },
    car_Model: {
        type: String,
        required: [true, 'model is required'],
        lowercase: true
    },
    year: Number,
    image: {
        type: String,
        required: [true, 'image is required'],
    },
    // license: {
    //     type: String,
    //     required: [true, 'image is required'],
    // },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: [true, 'can not at car without its owner']
    },
    deletedBy: {
        type: Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: 'User'
    },
    deleted: { type: Boolean, default: false },
    imagePublicId: String
}, {
    timestamps: true
})


const carModel = model("Car", carSchema);
export default carModel
