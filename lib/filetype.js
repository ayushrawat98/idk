import {fileTypeFromFile} from 'file-type';
import fs from 'fs'

export const filetype = async (req, res, next) => {
 	const t = await fileTypeFromFile(req.file.path)
	let allowed = ['video/mp4', 'video/webm', 'image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
	if (!allowed.includes(t.mime)) {
		fs.unlink(req.file.path, () => {})
		req.file = undefined
	}
	next()
}