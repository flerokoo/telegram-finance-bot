const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { isValidAmount } = require("./helpers");
const {
    getCategoriesAsyncGroupedBy,
    getCategoriesAsync,
    appendExpenseAsync,
    clearCachedValues,
    fillCacheValues
} = require("./spreadsheet");


// this state sends data to
const sender = new Scene("sender");

sender.enter(ctx => {
    var amount = ctx.session.expenseAmount;
    var category = ctx.session.expenseCategory;
    var descr = ctx.session.expenseDescription;
    var message = `Sending expenses to server: ${category}, ${amount} rub.`;
    Promise.all([
        ctx.reply(message),
        appendExpenseAsync(process.env.TARGET_SHEET_TITLE || "test", amount, category, descr)
    ]).then(([response]) => {
        bot.telegram.editMessageText(response.chat.id, response.message_id, undefined, message + ' Successful');
        ctx.scene.enter("index");
    }).catch(err => {
        ctx.reply("Something went wrong: " + err);
        ctx.scene.enter("index");
    })    
});



// this scene handles description of current expense
const description = new Scene("description");

description.enter(ctx => {
    ctx.reply("Enter description or /skip")
})

description.command("skip", ctx => {
    ctx.scene.enter("sender");
})

description.command("reset", ctx => {
    ctx.scene.enter("index");
});

description.on("message", ctx => {
    var text = ctx.message.text;
    if (typeof text === 'string' && text.trim().length > 0) {
        ctx.session.expenseDescription = text;
        ctx.scene.enter("sender");
    }
})



// this scene handles category entering
const categorizer = new Scene("categorizer");

categorizer.enter(ctx => {
    getCategoriesAsyncGroupedBy(3).then(categories => {        
        categories.push(["/reset"]);
        ctx.reply("Enter category", Markup.keyboard(categories).oneTime().resize().extra());
    }).catch(e => {
        console.log("Cat get grouped categories: " + e)        
    })
});

categorizer.command("reset", ctx => {
    ctx.scene.enter("index");
});

categorizer.on("message", ctx => {
    var category = ctx.message.text.toLowerCase();
    getCategoriesAsync().then(categories => {
        var idx = categories.findIndex(c => c.toLowerCase() === category);
        if (idx !== -1) {
            category = categories[idx];
            ctx.session.expenseCategory = category;
            ctx.scene.enter("description");
        } else {
            ctx.reply("Invalid category entered, try again")
        }
    }).catch(e => {
        console.warn("Cant get categories: " + e);
    })
})



// this is main scene where expenses input begins
const index = new Scene("index");
index.enter(ctx => {
    ctx.session.expenseCategory = undefined;
    ctx.session.expenseAmount = undefined;
    ctx.session.expenseDescription = undefined;
    ctx.reply("Enter expense amount");
});

index.command("refresh", ctx => {
    ctx.reply("Refreshing cached values...").then(response => {
        return { messageId: response.message_id, chatId: response.chat.id }
    }).then(({ messageId, chatId }) => {
        clearCachedValues();
        fillCacheValues().then(() => {
            bot.telegram.editMessageText(chatId, messageId, undefined, "Refreshing cached values successful");
        }).catch(err => {
            bot.telegram.editMessageText(chatId, messageId, undefined, "Refreshing cached values failed: " + err);
        })
    });
})

index.on("message", ctx => {
    if (isValidAmount(ctx.message.text)) {
        ctx.session.expenseAmount = parseFloat(ctx.message.text);
        ctx.scene.enter("categorizer");
    } else {
        ctx.reply("Not a valid number, try again");
    }
})



// this scene is self explanotary
const blocker = new Scene("blocker");
blocker.enter(ctx => ctx.reply("Sorry, this is private bot"));



// register all the scenes in stage
const stage = new Stage();
stage.register(index);
stage.register(sender);
stage.register(categorizer);
stage.register(blocker);
stage.register(description);



// and finally create and run bot itself
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());

bot.on("message", ctx => {
    ctx.scene.enter(ctx.message.from.id == process.env.TELEGRAM_USER_ID ? "index" : "blocker")
});



console.log("Filling cache values...")
fillCacheValues().then(() => {
    console.log("Starting bot...")
    bot.startPolling();
    console.log("Ready")
});



