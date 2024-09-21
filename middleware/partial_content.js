import {stat, createReadStream} from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
const fileInfo = promisify(stat)

const partial_content = async (req, res, path, mime) => {
    const {size} = await fileInfo(path);
    let [start, end] = req.headers.range.replace(/bytes=/, "").split("-");
    start = parseInt(start, 10);
    end = end ? parseInt(end, 10) : size-1;

    if(!isNaN(start) && isNaN(end)) {
        start = start;
        end = size - 1;
    }
    if(isNaN(start) && !isNaN(end)){
        start = size - end;
        end = size - 1;
    }

    if(start>=size || end>=size){
        res.writeHead(416, {
            "Content-Range": `bytes */${size}`
        })
        return res.end();
    }

    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Accept-Ranges": 'bytes',
        "Content-Length": end-start+1,
        "Content-Type": mime,
    })

    let readable = createReadStream(path, {start: start, end: end});
    // await pipeline(readable, res, err => {
    //     if(err) {
    //         console.error(err);
    //         // return res.status(500).json({message: "An error has occured"})
    //     }
    // })
    readable.on('open', () => {
        return readable.pipe(res);
    })
}

export default partial_content;