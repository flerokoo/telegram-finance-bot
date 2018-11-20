const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

// this scene is self explanotary
const blocker = new Scene("blocker");
blocker.enter(ctx => ctx.reply("Sorry, this is private bot"));

module.exports = {
    scene: blocker,
    registerTo: stage => stage.register(blocker)
};