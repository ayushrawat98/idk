
import instance from "./db.js"

// instance.insertBoard('b','random bitching')
// instance.insertBoard('fit','yog and kasrat')
// instance.insertBoard('fa','vastra maya')
// instance.insertBoard('g','nerds assemble')

instance.db.exec("update posts set board_id = 1 , updated_at = '2025-10-31T13:48:49.323Z' where board_id != 1;")
instance.db.exec('delete from boards where id in (2,3,4);')
