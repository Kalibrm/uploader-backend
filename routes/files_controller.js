import { Router } from "express";
import uuid from '../middleware/generate_id.js'
import File from '../models/file.js'
import partial_content from '../middleware/partial_content.js'
import {createReadStream, access, mkdir, rm} from 'fs'
import { pipeline } from "stream";
import multer from "multer";
import {app_token} from '../middleware/check_tokens.js'
import mime from "mime";

const router = Router();

const storage = multer.diskStorage({
    destination: async (req, _file, cb) => {
        const dir = `${process.env.UPLOADS_DIR}/${req.user._id}`;
        access(dir, async (err) => {
            if(err){
                mkdir(dir, {recursive: true}, (err)=>{
                    if (err) return res.status(500).json({message: "An error has occured"});
                    cb(null, dir)
                });
            } else {
                cb(null, dir);
            }
        })
    },
    filename: (req, file, cb) => {
        req.fileID = uuid.getUniqueID();
        cb(null, `${req.fileID}.${mime.getExtension(file.mimetype)}`);
    }
})

const upload = multer({
    storage: storage,
    fileFilter: async (req, file, cb) => {
        switch (file.mimetype){
            case "video/x-ms-asf":
            case "video/x-msvideo":
                req.fileNotSupported = true;
                cb(null, false);
                break;
            default:
                cb(null, true);
                break;
        }
    }
})

router.post('/upload', app_token, upload.single('file'), async (req, res, _next)=>{
    if(req.fileNotSupported) return res.status(400).json({message: "File format not supported"});
    const user = req.user;
    const file = req.file;
    if(!file) return res.status(500).json({message: "File missing"});

    const db_file = new File({
        filename: file.filename,
        real_name: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        user_id: user._id,
        path: file.path
    })
    db_file._id = req.fileID;
    try {
        await db_file.save();
    } catch(err) {
        console.error(err);
        rm(file.path, err =>{
            console.error(err);
        })
        return res.status(500).json({message: "An error has occured"});
    }

    res.status(200).json({url: `${process.env.DEV ? "localhost:3000/files" : process.env.FILE_URL}/${db_file.filename}`});
})

router.get('/:filename', async (req, res, _next) =>{
    let file;
    try {
        file = await File.findOne({filename: req.params.filename}).exec();
        if(!file) return res.status(404).json({message: "File not found"});
    } catch (err) {
        if(err) return res.status(500).json({message: "An error has occured"});
    }
    const path = file.path;
    if (req.headers.range) {
        partial_content(req, res, path, file.mimetype)
    } else {
        res.writeHead(200, {
            "Content-Length": file.size,
            "Content-Type": file.mimetype
        })
        let readable = createReadStream(path);
        await pipeline(readable, res, err => {
            if(err) {
                console.error(err);
                // return res.status(500).json({message: "An error has occured"})
            }
        })
    }
})

export default router;