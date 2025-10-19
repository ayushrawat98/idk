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
					file_id INTEGER REFERENCES files(id) on delete cascade,
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
			getThreads: this.db.prepare('select t.id, t.title, t.content, t.username, t.created_at, f.path as image_path, count(p.id) as reply_count from posts t left join files f on t.file_id = f.id left join posts p on p.parent_id = t.id where t.board_id = ? and t.parent_id is null group by t.id order by t.updated_at desc limit 100;'),
			updateThread : this.db.prepare('update posts set updated_at = ? where id = ?'),

			insertFile : this.db.prepare('insert into files (path, thumbnail_path, mime_type, created_at) values (?,?,?,?)'),
			recentImages : this.db.prepare('select path from files order by created_at desc limit 6'),
			
			getThreadForPost: this.db.prepare('select t.id, t.title, t.content, t.username, f.path as image_path, t.created_at from posts t left join files f on t.file_id = f.id where t.id = ?'),
			getPosts : this.db.prepare('select p.id, p.parent_id, p.username, p.content, p.created_at, f.path as image_path from posts p left join files f on p.file_id = f.id where p.parent_id = ?'),
			insertPost : this.db.prepare('insert into posts (board_id, parent_id, username, content, file_id, created_at) values (?,?,?,?,?,?)')
		}
		// 	getThreads: this.db.prepare('select id, content, file, ogfilename, updated_at from posts where boardname = ? and threadid is null order by created_at desc limit 100'),
		// 	getThread: this.db.prepare('select  * from posts where id = ?'),
		// 	deleteThread: this.db.prepare('delete from posts where id = ?'),
		// 	createThread: this.db.prepare('insert into posts (boardname, content, ogfilename, file, mimetype, created_at, updated_at, username) values (?,?,?,?, ?,?,?,?)'),
		// 	getReplies: this.db.prepare('select id, content, ogfilename, file, mimetype from posts where threadid = ?'),
		// 	createReply: this.db.prepare('insert into posts (boardname, threadid, content, ogfilename, file, mimetype, created_at, replyto, username) values (?,?,?,?,?, ?,?,?,?)'),
		// 	updateReplyCount: this.db.prepare('update posts set replycount = replycount + 1 where id = ?'),
		// 	updateDate: this.db.prepare('update posts set updated_at = ? where id = ?'),
		// 	updateUsername: this.db.prepare('update posts set username = ? where id = ?'),
		// 	banUsername: this.db.prepare('insert into bans (username) values (?)'),
		// 	checkBan: this.db.prepare('select username from bans where username = ?'),
		// 	editPost: this.db.prepare('update posts set content = ? where id = ?')
		// }
		// this.queries.insertBoard.run('b','random bitching')
		// this.queries.insertBoard.run('fit','yog and fitness')
		// this.queries.insertBoard.run('fa','fashion vastra')
		// this.queries.insertBoard.run('g','tech nerds')
		// // this.queries.insertFile.run('/images/sugawara1.png','/images/sugawara2.png')
		// this.queries.insertThread.run(1, "Anonymous", "", "Dand dan ter yo nou nkdnnajbdjbasdbaskdjba dkas asdkjasbda dadhjad", 1)
		// this.queries.insertThread.run(1, "diuys", "wtf is this website", "Abra ka dabra gili gili chu", 1)
		// console.log(this.queries.getThreads.all(1))
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

// create table if not exists threads (
				// 	id integer primary key autoincrement,
				// 	board_id integer not null references boards(id) on delete cascade,
				// 	username text,
				// 	title text,
				// 	content text,
				// 	op_file_id integer references files(id),
				// 	pinned integer default 0,
  				// 	locked integer default 0,
  				// 	created_at text,
  				// 	updated_at text
				// );

				// create table if not exists posts (
  				// 	id integer primary key autoincrement,
  				// 	thread_id integer not null references threads(id) on delete cascade,
  				// 	username text,
  				// 	content text,
  				// 	file_id integer references files(id),
  				// 	created_at text
				// );