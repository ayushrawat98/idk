import instance from "./db.js"

instance.db.exec(`
	delete from posts where id = 36;
	delete from posts where id = 37;
	delete from posts where id = 38;
	delete from posts where id = 39;
	`)