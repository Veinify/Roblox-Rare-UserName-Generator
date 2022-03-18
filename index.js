const request = require('node-superfetch');
const request2 = require('async-request');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
const AsciiTable = require('ascii-table');
const { asyncSort, ObjectLength, avgCompleteTime, completeTime } = require('./util')
const ProgressBar = require("ora-progress-bar"); 

var colors = {
	RESET: '\033[39m',
	BLACK: '\033[90m',
	RED: '\033[91m',
	GREEN: '\033[92m',
	YELLOW: '\033[93m',
	BLUE: '\033[94m',
	MAGENTA: '\033[95m',
	CYAN: '\033[96m',
	WHITE: '\033[97m',
	UI1: '\033[37m',
	UI2: '\033[90m'
};
const title = fs.readFileSync('./title.txt', 'utf8');

/*---------------*/

let user;

/*---------------*/

async function init() {
	await console.log(
		`${colors.RED}${title.toString()}\n${colors.UI2}Made by: ${
			colors.CYAN
		}Veinify#1210\n${colors.UI1}Found a bug? Please send me a dm on my discord!`
	);
	await console.log(`${colors.GREEN}loaded!${colors.RESET}`);
	await console.log('...');
	await rl.question(
		`${colors.YELLOW}Enter Roblox user id:\n${colors.RESET}> ${
			colors.GREEN
		}`,
		async id => {
			user = id;
			start();
				}
			);
}

async function start() {
    let result = [];
  let count = 0;
	const username = await getUsername(user);
	let currentDate = Date.now()
	let userfriends = (await getFriends(user)).data.map(name => name.name)
	let friendsize = userfriends.length
	console.log(`${colors.YELLOW}Checking ${colors.RED}${username} ${colors.YELLOW}most famous friend... (Estimated time: ${avgCompleteTime(friendsize)} seconds)`)
	if (friendsize <= 0) {
	    console.log(`${colors.WHITE}${username} ${colors.UI1}doesn't have any friend!`);
	    process.exit();
	}
    const bar = new ProgressBar("Current Progress:", friendsize);
	const table = new AsciiTable(`${username}'s Most Famous Friends`)
	  .setHeading('Username', 'Follower', 'Place Visit')
	for (const user of userfriends) {
	    const id = await getUserId(user);
	    const followcount = await getUserFollowCount(id);
	    const placevisit = await getUserPlaceVisits(id);
	    const isbanned = await isBanned(id);
        bar.progress()
	    table.addRow(isbanned ? `${user} [BANNED]` : user, followcount, placevisit)
	};
    table.sortColumn(1, function(a,b) {return b - a})
	console.log(`${colors.RESET}${table}`)
	fs.writeFileSync('./result.txt', table.toString())
	console.log(`${colors.WHITE}The result has been writen in ${colors.YELLOW}result.txt ${colors.WHITE}file.`)
	var data = {
	    time: completeTime(Date.now(), currentDate),
	    userSize: friendsize
	}
	fs.writeFileSync('./data.txt', JSON.stringify(data))
	console.log(`${colors.BLUE}Completed in ${colors.CYAN}${completeTime(Date.now(), currentDate)}${colors.BLUE} second(s).${colors.RESET}`)
	process.exit();
}
async function getFriends(id) {
	try {
		const { body } = await request.get(
			`https://friends.roblox.com/v1/users/${id}/friends`
		);
		return body;
	} catch (e) {
		console.log(e)
	}
}
async function getUsername(id) {
	try {
		const { body } = await request.get(`https://api.roblox.com/users/${id}`);
		return body.Username;
	} catch (e) {
		console.log(e)
	}
}

async function getUserId(name) {
	try {
		const { body } = await request.get(`https://api.roblox.com/users/get-by-username?username=${name}`);
		return body.Id;
	} catch (e) {
		console.log(e)
	}
}

async function getUserFollowCount(id) {
	try {
		const { body } = await request.get(`https://friends.roblox.com/v1/users/${id}/followers/count`);
		return body.count;
	} catch (e) {
		console.log(e)
	}
}

async function isBanned(id) {
	try {
		const { body } = await request.get(`https://users.roblox.com/v1/users/${id}`);
		return body.isBanned;
	} catch (e) {
		console.log(e)
	}
}

async function getUserPlaceVisits(id) {
	try {
        let c = 0;
		const { body } = await request.get(`https://games.roblox.com/v2/users/${id}/games?sortOrder=Asc&limit=50`);
		for (const game of body.data) {
            c += game.placeVisits
        }
        return c;
	} catch (e) {
		console.log(e)
	}
}
init();