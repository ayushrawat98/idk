import express from 'express';

const route = express.Router()

route.get('/:boardName', async (req, res, next) => {
	return res.render('board.html', {
		board: req.params.boardName,
		boards: ['b', 'g', 'fit', 'fa'],
		datalist: [
			{
				name: 'piyush',
				date : new Date(),
				postNumber : 1234,
				board : 'b',
				content: "Standing here i realise you were just like me with someone just like you but whose to judge the rioght from wrong when our gaurd is down i think we will both agree that violence breeds violence and in the end it has to be this way"
			},
			{
				name : 'anonymous',
				date : new Date(),
				postNumber : 76543,
				board : 'b',
				content : "Arre yaar iss admin ki such me maaa ki chutttt"
			}
		]
	});
})

route.get('/:boardName/thread/:threadName', async (req, res, next) => {
	return res.render('thread.html', {
		board: req.params.boardName,
		boards: ['b', 'g', 'fit', 'fa'],
		datalist: [
			{
				name: 'piyush',
				date : new Date(),
				postNumber : 1234,
				board : 'b',
				content: "Standing here i realise you were just like me with someone just like you but whose to judge the rioght from wrong when our gaurd is down i think we will both agree that violence breeds violence and in the end it has to be this way"
			},
			{
				name : 'anonymous',
				date : new Date(),
				postNumber : 76543,
				board : 'b',
				content : "Arre yaar iss admin ki such me maaa ki chutttt"
			}
		]
	});
})

export { route as boardRoute }
