import express from 'express';
import nunjucks from 'nunjucks';
import path from "path";
import { fileURLToPath } from "url";
import { boardRoute } from './routes/board.route.js';

const app = express()

nunjucks.configure('views', {
	autoescape: true,
	express: app,
	noCache : false
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));


app.use('', boardRoute)

app.listen(3000, () => {
	console.log("Server started at port 3000")
})