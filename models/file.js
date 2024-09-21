import {Schema, model} from 'mongoose'

const fileSchema = new Schema({
    _id: String,
    filename: {
        type: String,
        required: true,
        unique: true
    },
    real_name: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    }
})

export default model("File", fileSchema);