const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const sessionValues = require("../utils/session-values");

// this scene handles description of current expense
const descriptor = new Scene("descriptor");

description.enter(ctx => {
    ctx.reply("Enter description or /skip")
})

description.command("skip", ctx => {
    ctx.scene.enter("sender");
})

description.command("reset", ctx => {
    ctx.scene.enter("main");
});

description.on("message", ctx => {
    var text = ctx.message.text;
    if (typeof text === 'string' && text.trim().length > 0) {
        ctx.session[sessionValues.operationDescription] = text;
        ctx.scene.enter("sender");
    }
})



module.exports = {
    scene: description,
    registerTo: stage => stage.register(description)
};