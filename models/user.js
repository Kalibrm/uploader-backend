import { Schema, model } from "mongoose";

const userSchema = new Schema({
    _id: String,
    app_token: {
        type: String,
        required: true,
        unique: true
    },
    user_token: {
        type: String,
        required: false,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    }
})

export default model('User', userSchema);