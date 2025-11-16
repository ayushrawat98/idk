export const ratelimit = (increasetime = 5000, map) => async (req, res, next) => {
	const address =  req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
	const currenttime = Date.now()
	if(map[address] == undefined){
		map[address] = currenttime + increasetime
		return next()
	}
	else if(map[address] - currenttime  > 0){
		map[address] += increasetime 
		return res.status(429).send(`Wait ${Math.trunc((map[address] - currenttime)/1000)} seconds.`)
	}else{
		map[address] = currenttime + increasetime + Math.trunc(Math.random()*increasetime)
		return next()
	}
}