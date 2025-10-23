import express from 'express';
import instance from '../db/db.js';
import upload from '../lib/multer.js';
import fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';
import { thumbnail } from '../lib/thumbnail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const route = express.Router()

route.get('/', async (req, res, next) => {
	const boardsList = instance.getBoards()
	const recentImages = instance.getRecentImages()
	return res.render('index.html', {boards : boardsList, title : 'IndiaChan', images : recentImages , index : true});
})


//-----BOARDS------

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

route.post('/board/:boardName', upload.single("file"), thumbnail, async (req, res, next) => {
	//redirect to newly created thread with the id
	//insert file
	let fileObj = {
		path : req.file.filename,
		thumbnail_path : req.file.filename,
		mime_type : req.file.mimetype,
		created_at : new Date().toISOString()
	}
	const newFile = instance.insertFile(fileObj)
	const boardId = instance.getBoards().filter(board => board.name == req.params.boardName)[0].id
	let obj = {
		board_id : boardId,
		username : req.body.name.trim() == '' ? 'Anonymous' : req.body.name.trim(),
		title : req.body.title,
		content : req.body.content,
		op_file_id : newFile.lastInsertRowid,
		created_at : new Date().toISOString(),
		updated_at : new Date().toISOString()
	}
	const newThread = instance.insertThread(obj)
	return res.redirect('/board/'+ req.params.boardName)
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

route.post('/board/:boardName/thread/:threadName', upload.single("file"), thumbnail,  async (req, res, next) => {

	let newFile = undefined

	if(req.file){
		let fileObj = {
			path : req.file.filename,
			thumbnail_path : req.file.filename,
			mime_type : req.file.mimetype,
			created_at : new Date().toISOString()
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
		created_at : new Date().toISOString(),
		updated_at : new Date().toISOString()
	}
	instance.insertPost(obj)
	if(!req.body.sage){
		instance.updateThread(new Date().toISOString(), req.params.threadName)
	}
	return res.redirect('/board/'+ req.params.boardName + '/thread/' + req.params.threadName)
})


//-------DELETE-------

function deleteThreadAndFile(threadId){
	const temp = instance.getThreadForPost(threadId)
	const tempfile = instance.getFile(temp.file_id)
	instance.db.prepare('delete from posts where id=?').run(threadId)
	instance.db.prepare('delete from files where id=?').run(temp.file_id)
	// console.log(path.join(__dirname, '..', 'public', 'files', tempfile.path))
	fs.unlink(path.join(__dirname, '..', 'public', 'files', tempfile.path), () => {})
	if(tempfile.mime_type.includes("video")){
		fs.unlink(path.join(__dirname, '..', 'public', 'thumbnails', tempfile.path+".png"), () => {})
	}
	// console.log(threadId , "deleted")
}

route.get('cleanup/:threadId', async (req, res, next) => {
	if(req.query.key != '1'){
		return res.end()
	}
	deleteThreadAndFile(req.params.threadId, )
	return res.send("done")
})

route.get('/cleanup', async(req, res, next) => {
	const allThreadsToDelete = instance.db.prepare('select id from posts where parent_id is null and board_id = 1 order by updated_at desc limit -1 offset 100').all()
	for(let thread of allThreadsToDelete){
		deleteThreadAndFile(thread.id)
	}
	res.send("done")
})


export { route as boardRoute }
