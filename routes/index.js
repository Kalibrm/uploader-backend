import {Router} from 'express'
const router = Router();

router.get("/", (req, res, next)=>{
    res.status(200).json({message: "Default route for API, WILL BE DELETED IN FUTURE"});
})