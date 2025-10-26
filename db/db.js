import sqlite from "better-sqlite3"
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


class DB {
	db;
	queries;
	constructor() {
		this.db = sqlite(path.join(__dirname, 'indiachan.db'), {})

		this.db.pragma('journal_mode = WAL')
		this.db.pragma("synchronous = NORMAL");
		this.db.pragma("journal_size_limit = 67108864"); // 64 MB
		this.db.pragma("mmap_size = 134217728"); // 128 MB
		this.db.pragma("cache_size = 2000");

		this.db.exec(
			`
				create table if not exists boards (
					id integer primary key autoincrement,
					name text not null unique,
					description text,
					disabled integer default 0
				);

				CREATE TABLE if not exists posts (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
					parent_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
					username TEXT,
					title TEXT,
					content TEXT,
					file_id INTEGER REFERENCES files(id),
					created_at TEXT,
					updated_at text
				);

				create table if not exists files (
					id integer primary key autoincrement,
					path text not null,
					thumbnail_path text not null,
					mime_type text,
					size integer,
  					width integer,
  					height integer,
  					created_at text
				);
				

            `
		)
		this.queries = {
			insertBoard: this.db.prepare('insert into boards (name, description) values (?,?)'),
			getBoards: this.db.prepare('select id, name, description from boards where disabled = 0'),

			insertThread: this.db.prepare('insert into posts (board_id, parent_id, username, title, content, file_id, created_at, updated_at) values (?,?,?,?,?,?,?,?)'),
			getThreads: this.db.prepare('select t.id, t.title, t.content, t.username, t.created_at, f.path as image_path, f.mime_type as mimetype, count(p.id) as reply_count from posts t left join files f on t.file_id = f.id left join posts p on p.parent_id = t.id where t.board_id = ? and t.parent_id is null group by t.id order by t.updated_at desc limit 50;'),
			updateThread : this.db.prepare('update posts set updated_at = ? where id = ?'),

			insertFile : this.db.prepare('insert into files (path, thumbnail_path, mime_type, created_at) values (?,?,?,?)'),
			recentImages : this.db.prepare("select id, path from files WHERE mime_type LIKE 'image/%' order by created_at desc limit 6"),
			getFile : this.db.prepare('select * from files where id = ?'),
			
			getThreadForPost: this.db.prepare('select t.id, t.title, t.content, t.username, t.file_id, t.created_at, f.path as image_path, f.mime_type as mimetype from posts t left join files f on t.file_id = f.id where t.id = ?'),
			getPosts : this.db.prepare('select p.id, p.parent_id, p.username, p.content, p.created_at, f.path as image_path, f.mime_type as mimetype from posts p left join files f on p.file_id = f.id where p.parent_id = ?'),
			insertPost : this.db.prepare('insert into posts (board_id, parent_id, username, content, file_id, created_at) values (?,?,?,?,?,?)')
		}
	}

	insertBoard(name, description) {
		this.queries.insertBoard.run(name, description)
	}

	getBoards() {
		return this.queries.getBoards.all()
	}

	insertThread(obj) {
		return this.queries.insertThread.run(obj.board_id, obj.parent_id, obj.username, obj.title, obj.content, obj.op_file_id, obj.created_at, obj.updated_at)
	}

	getThreads(id) {
		//pass the board id
		return this.queries.getThreads.all(id)
	}

	insertFile(obj) {
		return this.queries.insertFile.run(obj.path, obj.thumbnail_path, obj.mime_type, obj.created_at)
	}

	getRecentImages(){
		return this.queries.recentImages.all()
	}

	getFile(id){
		return this.queries.getFile.get(id)
	}

	getThreadForPost(id){
		return this.queries.getThreadForPost.get(id)
	}

	getPosts(id){
		return this.queries.getPosts.all(id)
	}

	insertPost(obj){
		return this.queries.insertPost.run(obj.board_id, obj.parent_id, obj.username, obj.content, obj.file_id, obj.created_at)
	}

	updateThread(date, id){
		return this.queries.updateThread.run(date, id)
	}
}

const instance = new DB()
export default instance