import express from 'express';

const route = express.Router()

route.get('/:boardName', async (req, res, next) => {
	res.render('board.html', {board : req.params.boardName });
})

export { route as boardRoute }
