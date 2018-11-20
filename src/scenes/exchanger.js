
const { getCurrencyDataAsync, getCurrencyNamesAsync } = require("../spreadsheet");
const { isValidAmount, validateCase, validateAmount } = require("../utils/helpers")
const sessionValues = require("../utils/session-values")

// this scenes handles currency entering


const exchangerEntry = new Scene("exchanger");
exchangeEntry.enter(ctx => {
    ctx.scene.enter("exchanger-from")
});



const exchangerFrom = new Scene("exchanger-from")

exchangerFrom.enter(ctx => {
    getCurrencyNamesAsync.then(currencies => {
        ctx.reply("Enter source currency", Markup.keyboard(currencies).oneTime().resize().extra());
    }).catch(err => {
        throw new Error(err);
    })
})

exchangerFrom.command("reset", ctx => ctx.scene.enter("main"));

exchangerFrom.on("message", ctx => {
    var text = ctx.message.text;
    
    getCurrencyNamesAsync().then(currencies => {        
        var validated = validateCase(text, currencies);
        if (validated !== null) {
            ctx.session[sessionValues.exchangeFrom] = validated;
            ctx.scene.enter("exchanger-to")
        } else {
            ctx.reply("Invalid currency entered, try again");
        }
    }).catch(err => {
        throw new Error(err);
    })
})




const exchangerTo = new Scene("exchanger-to")

exchangerTo.enter(ctx => {
    getCurrencyNamesAsync.then(currencies => {
        ctx.reply("Enter target currency", Markup.keyboard(currencies).oneTime().resize().extra());
    }).catch(err => {
        throw new Error(err);
    })
})

exchangerTo.command("reset", ctx => ctx.scene.enter("main"));

exchangerTo.on("message", ctx => {
    var text = ctx.message.text;
    
    getCurrencyNamesAsync().then(currencies => {        
        var validated = validateCase(text, currencies);
        if (validated !== null) {
            ctx.session[sessionValues.exchangeTo] = validated;
            ctx.scene.enter("exchanger-amount")
        } else {
            ctx.reply("Invalid currency entered, try again");
        }
    }).catch(err => {
        throw new Error(err);
    })
})




const exchangerAmount = new Scene("exchanger-amount")

exchangerAmount.enter(ctx => {
    getCurrencyNamesAsync.then(currencies => {
        var from = ctx.session[sessionValues.exchangeFrom];
        var to = ctx.session[sessionValues.exchangeTo];
        ctx.reply(`Enter amount to exchange from ${from} to ${to}`);
    }).catch(err => {
        throw new Error(err);
    })
})

exchangerAmount.command("reset", ctx => ctx.scene.enter("main"));

exchangerAmount.on("message", ctx => {
    var text = ctx.message.text;
    
    if (isValidAmount(text)) {
        ctx.session[sessionValues.exchangeAmount] = parseFloat(validateAmount(text));
        ctx.scene.enter("exchanger-rate");
    } else {
        ctx.reply("Invalid amount entered, try again");
    }
})




const exchangerRate = new Scene("exchanger-rate")

exchangerRate.enter(ctx => {
    getCurrencyDataAsync.then(({names, rates}) => {
        ctx.reply(`Enter exchange rate from menu or /custom`);
    }).catch(err => {
        throw new Error(err);
    })
})

exchangerRate.command("reset", ctx => ctx.scene.enter("main"));

exchangerRate.on("message", ctx => {
    var text = ctx.message.text;
    
    if (isValidAmount(text)) {
        ctx.session[sessionValues.exchangeAmount] = parseFloat(text);
        ctx.scene.enter("exchanger-rate");
    } else {
        ctx.reply("Invalid amount entered, try again");
    }
})





module.exports = {
    
    registerTo: stage => {
        stage.register(exchangerEntry)
        stage.register(exchangerFrom)
        stage.register(exchangerTo)
        stage.register(exchangerAmount)
        stage.register(exchangerRate)
    }
};