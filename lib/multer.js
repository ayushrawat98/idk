import multer from "multer";

const filefilter = (req, file, cb) => {
	let allowed = ['video/mp4', 'video/webm', 'image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb({ message: 'Unsupported File Format' }, false)
	}	
};

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/files')
	},
	filename: function (req, file, cb) {
		// const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		const uniquePrefix =Math.trunc(Math.random()*1000)
		cb(null,uniquePrefix+ "-"+file.originalname.normalize("NFKD").replace(/[^\w.\-() ]/g, "_") )
	}
})

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter: filefilter })
export default upload;