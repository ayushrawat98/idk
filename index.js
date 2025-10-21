import express from 'express';
import nunjucks from 'nunjucks';
import path from "path";
import { fileURLToPath } from "url";
import { boardRoute } from './routes/board.route.js';

const app = express()

const nunjucksEnv = nunjucks.configure('views', {
	autoescape: true,
	express: app,
	noCache : false
});

//filter for getting indian date
nunjucksEnv.addFilter('indianDate', (str) => {
	let t = new Date(str)
	return t.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
})

nunjucksEnv.addFilter('greenText', (str) => {
	let regex = /^(>(?!>).*?)$/gm
	return str.replace(regex, "<span style='color:green'>$1</span>")
})

//only in test url
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use('/public',express.static(path.join(__dirname, "public")));


app.use('', boardRoute)

app.listen(3000, () => {
	console.log("Server started at port 3000")
})