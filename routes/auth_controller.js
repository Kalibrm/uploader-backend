import { Router } from "express";
import User from "../models/user.js";
import uuid from "../middleware/generate_id.js";
import * as argon2 from 'argon2'
import pkg from "jsonwebtoken";

const {sign} = pkg;
const router = Router();

const allow_register = async (req, res, next) => {
    if(process.env.ALLOW_REGISTER) {
        next()
    } else {
        return res.status(401).json({message: "Server does not accept new registrations"})
    }
}

router.post('/register', allow_register, async (req, res, next) => {
    if(!req.body.username || !req.body.password) return res.status(400).json("Missing username or password");

    const user_id = uuid.getUniqueID();
    const user = new User({
        _id: String(user_id),
        username: req.body.username
    })

    try {
        const appToken = sign({'^': "!@"}, process.env.TOKEN_SECRET, {header: {user_id: String(user_id), type: 'User'}, noTimestamp: true});
        user.app_token = String(appToken);
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "An error has occured"});
    }

    try {
        const hash = await argon2.hash(req.body.password, {
            type: argon2.argon2i
        })
        user.password = String(hash);
    } catch(err) {
        console.error(err);
        return res.status(500).json({message: "An error has occured"});
    }

    try {
        await user.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "An error has occured"});
    }
    user.password=undefined;
    res.status(201).send(user);
})

export default router;