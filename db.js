import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/uploader';

mongoose.connect(MONGO_URI, {
    autoIndex: false,
    compressors: ["zlib","zstd","none"],
    zlibCompressionLevel: 7
})
 .then(() => {
    console.log(`Connected to MongoDB`)
 })
 .catch((err)=> {
    console.error(`Error connecting to MongoDB: ${err}`);
 })