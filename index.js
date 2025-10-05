import express from 'express';
import nunjucks from 'nunjucks';
import path from "path";
import { fileURLToPath } from "url";
import { boardRoute } from './routes/board.route.js';
import { threadRoute }  from './routes/thread.route.js';



const app = express()

nunjucks.configure('views', {
	autoescape: true,
	express: app
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get('/', async (req, res, next) => {
	res.render('index.html', {boards : ['b', 'g', 'fit', 'fa'], title : 'Anonymouse', images : ['/images/sugawara1.png', '/images/sugawara2.png'] });
})
app.use('/board', boardRoute)
app.use('/thread', threadRoute)

app.listen(3000, () => {
	console.log("Server started at port 3000")
})