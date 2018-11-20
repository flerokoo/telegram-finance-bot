// this scene is self explanotary
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const {
    clearCachedValues,
    fillCacheValues
} = require("../spreadsheet")

const refresher = new Scene("refresher");

refresher.enter(ctx => {
    clearCachedValues();
    fillCacheValues().then(() => {        
        ctx.scene.enter("main");
    }).catch(err => {
        ctx.reply("Refreshing cache failed: " + err);
    })
});

refresher.on("message", ctx => {
    ctx.reply("Refreshing cache now. Try again in couple of seconds.")
})

module.exports = {
    scene: refresher,
    registerTo: stage => stage.register(refresher)
};