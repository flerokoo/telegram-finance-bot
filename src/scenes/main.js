const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const sessionValues = require("../utils/session-values")
const { validateAmount, isValidAmount } = require("../utils/helpers");

const main = new Scene("main");

main.enter(ctx => {
    ctx.session.expenseCategory = undefined;
    ctx.session.expenseAmount = undefined;
    ctx.session.expenseDescription = undefined;
    ctx.session.expenseCurrency = undefined;
    ctx.reply("Enter expense amount or /exchange");
});

main.command("refresh", ctx => {
    ctx.reply("Refreshing cached values...");
    ctx.scene.enter("refresher")
})

main.command("exchange", ctx => {    
    ctx.scene.enter("exchanger")
})

main.on("message", ctx => {
    if (isValidAmount(ctx.message.text)) {
        ctx.session[sessionValues.operationAmount] = parseFloat(validateAmount(ctx.message.text));
        ctx.scene.enter("currency-setter");
    } else {
        ctx.reply("Not a valid number, try again");
    }
})

module.exports = {
    scene: main,
    registerTo: stage => stage.register(main)
};