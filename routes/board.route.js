import express from 'express';
import instance from '../db/db.js';
import upload from '../lib/multer.js';
import fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';
import { thumbnail } from '../lib/thumbnail.js';
import nodeIpgeoblock from 'node-ipgeoblock';
import DOMPurify from "isomorphic-dompurify";
import { ratelimit } from '../lib/ratelimit.js';
import { filetype } from '../lib/filetype.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const route = express.Router()

route.get('/', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const recentImages = instance.getRecentImages()
	// const randomFile = instance.getRandomFile()
	return res.render('index.html', { boards: boardsList, title: 'Indiachan', images: recentImages, index: true });
})


//-----BOARDS------

route.get('/board/:boardName', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const currentBoard = boardsList.filter(board => board.name == req.params.boardName)[0]
	let threadsList = instance.getThreads(currentBoard.id)
	// threadsList.forEach(t => {
	// 	let temp = JSON.parse(t['latest_replies'])
	// 	if(temp.length == 0){
	// 		temp = null
	// 	}else{
	// 		temp.reverse()
	// 	}
	// 	t['latest_replies'] = temp
	// })
	// threadsList.forEach(t => t['latest_replies'].reverse())
	// console.log(threadsList)

	//wont work because we need notifications for new reply on bottom threads
	// const now = Date.now();
	// // weights you can tune:
	// const decayFactor = 1.1;   // how fast older threads decay in score
	// const replyWeight = 0.15;  // how much each reply counts

	// threadsList.sort((a, b) => {
	// 	const ageA = (now - new Date(a.created_at).getTime()) / 3600000; // seconds old
	// 	const ageB = (now - new Date(b.created_at).getTime()) / 3600000;

	// 	// scoring function — newer is better, more replies = bonus
	// 	const scoreA = (1/ageA) + (a.reply_count*0.01);
	// 	const scoreB = (1/ageB) + (b.reply_count*0.01) ;
	// 	// console.log(scoreA, scoreB)

	// 	// higher score first
	// 	return scoreB - scoreA;
	// });


	return res.render('board.html', {
		board: currentBoard,
		boards: boardsList,
		datalist: threadsList
	});
})

const blocker = nodeIpgeoblock({geolite2: "./public/GeoLite2-Country.mmdb",allowedCountries : ["IN"]});
let boardMap = {}
route.post('/board/:boardName', ratelimit(300000, boardMap), blocker, upload.single("file"), filetype, thumbnail, async (req, res, next) => {
	const boardId = instance.getBoards().filter(board => board.name == req.params.boardName)[0]?.id
	if (!boardId) {
		return res.end("Teri maa ki chut")
	}
	const sanitizedText = DOMPurify.sanitize(req.body.content.trim(), {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: []
	});

	if (sanitizedText.length == 0) {
		return res.end("Teri maa ki chut")
	}

	if(!req.file){
		return res.end()
	}

	let fileObj = {
		path: req.file.filename,
		thumbnail_path: req.file.filename,
		mime_type: req.file.mimetype,
		created_at: new Date().toISOString()
	}
	const newFile = instance.insertFile(fileObj)

	let obj = {
		board_id: boardId,
		username: req.body.name.trim() == '' ? 'Anonymous' : req.body.name.trim().slice(0, 255),
		title: req.body.title.trim().slice(0, 255),
		content: sanitizedText.slice(0, 4000),
		op_file_id: newFile?.lastInsertRowid ?? null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	}
	const newThread = instance.insertThread(obj)
	return res.redirect('/board/' + req.params.boardName)
})

//-----THREADS-----

route.get('/board/:boardName/thread/:threadName', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const currentBoard = boardsList.filter(board => board.name == req.params.boardName)[0]
	const currentThread = instance.getThreadForPost(req.params.threadName) //threadName is a integer
	const currentPosts = instance.getPosts(req.params.threadName)
	// console.log(currentPosts)
	const combined = [currentThread, ...currentPosts]
	return res.render('thread.html', {
		board: currentBoard,
		boards: boardsList,
		datalist: combined
	});
})

let threadMap = {}
route.post('/board/:boardName/thread/:threadName', ratelimit(8000, threadMap), blocker, upload.single("file"), filetype, thumbnail, async (req, res, next) => {

	const boardsList = instance.getBoards()
	const currentBoard = boardsList.filter(board => board.name == req.params.boardName)[0]
	const threadExist = instance.getThreadForPost(req.params.threadName)

	if (!currentBoard || !threadExist) {
		return res.end("Teri maa ki chut")
	}

	const sanitizedText = DOMPurify.sanitize(req.body.content.trim(), {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: []
	});

	if (sanitizedText.length == 0) {
		return res.end("Teri maa ki chut")
	}

	let newFile = undefined

	if (req.file) {
		let fileObj = {
			path: req.file.filename,
			thumbnail_path: req.file.filename,
			mime_type: req.file.mimetype,
			created_at: new Date().toISOString()
		}
		newFile = instance.insertFile(fileObj)
	}

	let obj = {
		board_id: currentBoard.id,
		parent_id: req.params.threadName,
		username: req.body.name.trim() == '' ? 'Anonymous' : req.body.name.trim().slice(0, 255),
		content: sanitizedText.slice(0, 4000),
		file_id: newFile?.lastInsertRowid ?? null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString()
	}
	instance.insertPost(obj)
	// removed sage
	// if (!req.body.sage) {
		instance.updateThread(new Date().toISOString(), req.params.threadName)
	// }
	return res.redirect('/board/' + req.params.boardName + '/thread/' + req.params.threadName)
})


//ADMIN
route.get('/adminsaab', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const currentBoard = boardsList.filter(board => board.name == 'bakchodi')[0]
	let threadsList = instance.getThreads(currentBoard.id)
	

	return res.render('admin.html', {
		board: currentBoard,
		boards: boardsList,
		datalist: threadsList
	});
})



//-------index image click--------

route.get('/goto/:imageId', async (req, res, next) => {
	const imageId = req.params.imageId
	const relevantThread = instance.db.prepare('select * from posts where file_id = ?').get(imageId)
	const boardName = instance.getBoards().filter(board => board.id == relevantThread.board_id)[0]?.name
	if (relevantThread && relevantThread.parent_id != null) {
		return res.redirect('/board/' + boardName + '/thread/' + relevantThread.parent_id)
	} else if (relevantThread && relevantThread.parent_id == null) {
		return res.redirect('/board/' + boardName + '/thread/' + relevantThread.id)
	} else {
		res.end("404")
	}

})

// route.get('/favicon.ico', async(req,res,next) => {
// 	return res.sendFile(path.join(__dirname, '..', 'public', 'favicon.ico'))
// })


//-------DELETE-------

function deleteThreadAndFile(threadId) {
	const temp = instance.getThreadForPost(threadId)
	const tempfile = instance.getFile(temp.file_id)
	const tempReplies = instance.getPosts(threadId)
	//delete main thread
	const deleteThread = instance.db.prepare('delete from posts where id=?')
	deleteThread.run(threadId)
	//delete main thread file
	const deleteFile = instance.db.prepare('delete from files where id=?')
	deleteFile.run(temp.file_id)
	//delete all replies

	for (let i = 0; i < tempReplies.length; ++i) {
		// deleteThread.run(tempReplies[i].id) //not required as parent has on delete cascade
		const tempfile2 = instance.getFile(tempReplies[i].file_id)
		deleteFile.run(tempReplies[i].file_id)
		if (tempfile2 && tempfile2.path.trim().length > 0) {
			fs.unlink(path.join(__dirname, '..', 'public', 'files', tempfile2.path), () => { })
		}
		if (tempfile2 && tempfile2.mime_type.includes("video")) {
			fs.unlink(path.join(__dirname, '..', 'public', 'thumbnails', tempfile2.path + ".png"), () => { })
		}
	}
	// console.log(path.join(__dirname, '..', 'public', 'files', tempfile.path))
	if (tempfile && tempfile.path.trim().length > 0) {
		fs.unlink(path.join(__dirname, '..', 'public', 'files', tempfile.path), () => { })
		fs.unlink(path.join(__dirname, '..', 'public', 'thumbnails', tempfile.path), () => { })
		if (tempfile.mime_type.includes("video")) {
			fs.unlink(path.join(__dirname, '..', 'public', 'thumbnails', tempfile.path + ".png"), () => { })
		}
	}

	// console.log(threadId , "deleted")
}

function cleanupMain() {
	const allThreadsToDelete = instance.db.prepare('select id from posts where parent_id is null and board_id = 1 order by updated_at desc limit -1 offset 100').all()
	// console.log(instance.db.prepare('select * from files').all())
	for (let thread of allThreadsToDelete) {
		deleteThreadAndFile(thread.id)
	}
}

route.get('/cleanup/:threadId', async (req, res, next) => {
	if (req.query.key != '1') {
		return res.end()
	}
	deleteThreadAndFile(req.params.threadId,)
	return res.send("done")
})

route.get('/cleanup', async (req, res, next) => {
	cleanupMain()
	res.send("done")
})


export { route as boardRoute }
