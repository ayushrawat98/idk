
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpeg from "fluent-ffmpeg";


// ffmpeg.setFfmpegPath('C:\\Users\\aayus\\Downloads\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe')

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const thumbnail = async (req, res, next) => {
	if(req.file == undefined || req.file == null){
		return next()
	}
	let ogfilePath = path.join(__dirname, '..', 'public', 'files', req.file.filename)
	let thumbfilePath = path.join(__dirname, '..', 'public', 'thumbnails', req.file.filename + ".png")

	if(req.file.mimetype.startsWith('video')) {
		ffmpeg(ogfilePath)
			.frames(1)
			.outputOptions(["-vf", "thumbnail,scale=100:100:force_original_aspect_ratio=increase,crop=100:100"])
			.size("100x100")  
			.save(thumbfilePath);
	}

	next()
}