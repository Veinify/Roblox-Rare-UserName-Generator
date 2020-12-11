module.exports = {
    autoStart: {
        enabled: false, //Turning this on will auto start the username sniper for you
        maxAmount: 1 // Put null/undefined if you want it to be infinity/endless.
    },
    minimumLetters: 3, // The minimum amount of letter that can be generated. 3 is the lowest.
    maximumLetters: 4, // The maximum amount of letter that can be generated. 20 is the highest.
    useDiscordWebhook: {
        enabled: false, //Send a msg to the webhook channel if there is a name that successfully sniped
        webhookLink: "" // https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks
    },
    useWebServer: false //If you are using a website host (eg. replit, glitch) then you may turn this on to keep your project alive. Tutorial: https://repl.it/talk/learn/Hosting-discordjs-bots-on-replit-Works-for-both-discordjs-and-Eris/11027
};