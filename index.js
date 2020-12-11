const request = require('request');
const fs = require('fs');
const readline = require('readline');
const config = require('./config');
const { WebhookClient, MessageEmbed } = require('discord.js');
const express = require('express');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

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
let max = 0;
let current = 0;
let paused = false;
const title = fs.readFileSync('./title.txt', 'utf8');

async function init() {
	await console.log(
		`${colors.RED}${title.toString()}\n${colors.UI2}Made by: ${
			colors.CYAN
		}Veinify#1210\n${colors.UI1}Found a bug? Please send me a dm on my discord!`
	);
	await checkConfig();
	await console.log(`${colors.GREEN}loaded!${colors.RESET}`);
	await console.log('...');
	if (!config.autoStart.enabled) {
		await rl.question(
			`${colors.YELLOW}How many usernames do you want to generate?\n${colors.RESET}> ${colors.GREEN}`,
			amount => {
				if (!isNaN(amount)) {
					max = amount;
					console.log(
						`${colors.GREEN}Done! This might take some time, Please wait till the process is completed!${
							colors.RESET
						}`
					);
					userLoop();
				} else {
					console.log(
						`${colors.RED}Invalid input (val=${amount}). Please try again!`
					);
					process.exit();
				}
			}
		);
	} else {
		max = config.autoStart.maxAmount;
		userLoop();
	}
}

function checkConfig() {
	if (
		config.minimumLetters < 3 ||
		config.minimumLetters > 20 ||
		config.maximumLetters < 3 ||
		config.maximumLetters > 20
	) {
		console.error(
			`${
				colors.RED
			}The minimum amount of letters per username is 3, And the maximum is 20. You can change this in your config file.`
		);
		process.exit();
	}
	if (
		typeof config.autoStart.enabled !== 'boolean' ||
		typeof config.useDiscordWebhook.enabled !== 'boolean'
	) {
		console.log(
			`${
				colors.RED
			}The 'enabled' options in your config file must be a boolean. (true/false)`
		);
		process.exit();
	}
	if (
		config.autoStart.enabled &&
		typeof config.autoStart.maxAmount === 'string'
	) {
		console.error(
			`${
				colors.RED
			}The maxAmount must not be a string! You can change this in your config file.`
		);
		process.exit();
	}
	if (
		(config.useDiscordWebhook.enabled &&
			!config.useDiscordWebhook.webhookLink) ||
		(config.useDiscordWebhook.enabled &&
			config.useDiscordWebhook.webhookLink === '')
	) {
		console.error(
			`${
				colors.RED
			}Missing webhook link. If you don't wanna use it, You can disable it on the config file.`
		);
		process.exit();
	}
}
function getRandomName(length) {
	var result = '';
	let max_ = 1;
	let i;
	var characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (i = 0; i < length; i++) {
		if (max_ > 0) {
			if (i > 0 && i < length - 1) {
				let num = Math.floor(Math.random() * 100) + 1;
				if (num > 80) {
					max_ -= 1;
					i++;
					result += '_';
					//return;
				}
			}
		}
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function userLoop() {
	setInterval(() => {
		if (paused) return;
		if (current < max || !max) {
			const max = config.maximumLetters;
			const min = config.minimumLetters;
			const length = Math.random() * (max - min) + min;
			getUser(getRandomName(length));
			//getUser('re')
		} else {
			console.log(`${colors.GREEN}Process is completed!`);
			process.exit();
		}
	}, 500);
}

function getUser(username) {
	request(
		`https://api.roblox.com/users/get-by-username?username=${username}`,
		function(error, response, body) {
			if (body.toString() === 'The service is unavailable.') {
				console.log(
					`${
						colors.RED
					}RobloxApiError: The service is currently unavailable. The snipes will be paused for 1 minute.`
				);
				pauseSnipe(60000);
				return;
			}
			body = JSON.parse(body);
			if (body.success === undefined) body['success'] = true;
			if (error || !body.success) {
				console.log(
					`${colors.RESET}This username is available!\nUsername: ${username}${
						!max ? '' : `\n(${current + 1}/${max})`
					}`
				);
				if (config.useDiscordWebhook.enabled) {
					try {
						const idntoken = config.useDiscordWebhook.webhookLink
							.replace('https://discord.com/api/webhooks/', '')
							.split('/');
						const hook = new WebhookClient(idntoken[0], idntoken[1]);
						const embed = new MessageEmbed()
							.setTitle('Username Sniped!')
							.addField('Username:', username, true)
							.setColor('RANDOM')
							.setFooter('Made by Veinify#1210')
							.setTimestamp();
						hook.send(embed);
					} catch (e) {
						console.log(
							`${colors.RED}You have provided an invalid webhook link.${
								colors.RESET
							}`
						);
						process.exit();
					}
				}
				current++;
				return;
			} else return; //console.log(`${username} is taken.`);
		}
	);
}
function pauseSnipe(time) {
	paused = true;
	setTimeout(() => {
		paused = false;
		console.log(`${colors.GREEN}The snipe has been resumed.`);
	}, time);
}
if (config.useWebServer) {
	const server = express();
	server.all('/', (req, res) => {
		res.send(`Your username sniper is on!`);
	});
	server.listen(3000);
}
init();
