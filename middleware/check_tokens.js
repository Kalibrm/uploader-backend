import User from '../models/user.js'

export const app_token = async (req, res, next) => {
    const token = req.header('Authorization');
    if(!token || token.substring(0,6).toLowerCase()!="bearer") return res.status(401).json({message: "No access"})
    try {
        const user = await User.findOne({app_token: token.slice(7)}).exec();
        if(!user) return res.status(401).json({message: "Invalid token"});
        req.user = user;
        next();
    } catch(err) {
        if(err) return res.status(500).json({message: "An error has occured"});
    }
}
    