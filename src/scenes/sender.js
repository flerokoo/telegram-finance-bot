
// this state sends data to
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const sessionValues = require("../utils/session-values");

const sender = new Scene("sender");
const { appendEntryAsync } = require("../spreadsheet")

sender.enter(ctx => {
    var amount = ctx.session[sessionValues.operationAmount];
    var category = ctx.session[sessionValues.operationCategory];
    var descr = ctx.session[sessionValues.operationDescription];
    var currency = ctx.session[sessionValues.operationCurrency];
    
    var message = `Sending expenses to server: ${category}, ${amount} ${currency}.`;
    Promise.all([
        ctx.reply(message),
        appendEntryAsync(process.env.TARGET_SHEET_TITLE || "test", amount, currency, category, descr)
    ]).then(([response]) => {
        bot.telegram.editMessageText(response.chat.id, response.message_id, undefined, message + ' Successful');
        ctx.scene.enter("main");
    }).catch(err => {
        ctx.reply("Something went wrong: " + err);
        ctx.scene.enter("main");
    })    
});

module.exports = {
    scene: sender,
    registerTo: stage => stage.register(sender)
};