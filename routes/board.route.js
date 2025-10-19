import express from 'express';
import instance from '../db/db.js';
import upload from '../lib/multer.js';

const route = express.Router()

route.get('/', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const recentImages = instance.getRecentImages()
	return res.render('index.html', {boards : boardsList, title : 'IndiaChan', images : recentImages , index : true});
})

route.get('/board/:boardName', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const currentBoard = boardsList.filter(board => board.name == req.params.boardName)[0]
	const threadsList = instance.getThreads(currentBoard.id)
	// console.log(threadsList)

	return res.render('board.html', {
		board: currentBoard,
		boards: boardsList,
		datalist: threadsList
	});
})

route.post('/board/:boardName', upload.single("file"), async (req, res, next) => {
	//redirect to newly created thread with the id
	//insert file
	let fileObj = {
		path : 'files/'+req.file.filename,
		thumbnail_path : 'files/'+req.file.filename,
		mime_type : req.file.mimetype,
		created_at : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
	}
	const newFile = instance.insertFile(fileObj)
	const boardId = instance.getBoards().filter(board => board.name == req.params.boardName)[0].id
	let obj = {
		board_id : boardId,
		username : req.body.name.trim() == '' ? 'Anonymous' : req.body.name.trim(),
		title : req.body.title,
		content : req.body.content,
		op_file_id : newFile.lastInsertRowid,
		created_at : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
		updated_at : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
	}
	const newThread = instance.insertThread(obj)
	return res.redirect('/board/'+ req.params.boardName)
})

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

route.post('/board/:boardName/thread/:threadName', upload.single("file"),  async (req, res, next) => {

	let newFile = undefined

	if(req.file){
		let fileObj = {
			path : 'files/'+req.file.filename,
			thumbnail_path : 'files/'+req.file.filename,
			mime_type : req.file.mimetype,
			created_at : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
		}
		newFile = instance.insertFile(fileObj)
	}
	
	const boardsList = instance.getBoards()
	const currentBoard = boardsList.filter(board => board.name == req.params.boardName)[0]

	let obj = {
		board_id : currentBoard.id,
		parent_id : req.params.threadName,
		username : req.body.name.trim() == '' ? 'Anonymous' : req.body.name.trim(),
		content : req.body.content,
		file_id : newFile?.lastInsertRowid ?? null,
		created_at : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
		updated_at : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
	}

	instance.insertPost(obj)
	instance.updateThread(new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), req.params.threadName)
	
	return res.redirect('/board/'+ req.params.boardName + '/thread/' + req.params.threadName)
})


export { route as boardRoute }
