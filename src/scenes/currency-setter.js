const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const sessionValues = require("../utils/session-values")
const { getCurrencyDataAsync, getCurrencyNamesAsync } = require("../spreadsheet");
// this scene handles currency entering
const currencySetter = new Scene("currency-setter");

currencySetter.enter(ctx => {
    getCurrencyDataAsync().then(data => {    
        var kb = data.names.map(name => [name]);
        kb.push(["/reset"]);

        var ratesText = data.names.map(name => `1 ${name} = ${data.rates[name]} RUB`).join('\n');

        ctx.reply("Enter currency \n" + ratesText, Markup.keyboard(kb).oneTime().resize().extra());

    }).catch(e => {
        console.log("Cant get currency data: " + e)        
    })
});

currencySetter.command("reset", ctx => {
    ctx.scene.enter("main");
});

currencySetter.on("message", ctx => {
    var name = ctx.message.text.toLowerCase();
    getCurrencyNamesAsync().then(names => {
        var idx = names.findIndex(c => c.toLowerCase() === name);
        if (idx !== -1) {
            name = names[idx];
            ctx.session[sessionValues.operationCurrency] = name;
            ctx.scene.enter("categorizer");
        } else {
            ctx.reply("Invalid currency entered, try again")
        }
    }).catch(e => {
        console.warn("Cant get currency names: " + e);
    })
})


module.exports = {
    scene: currencySetter,
    registerTo: stage => stage.register(currencySetter)
};