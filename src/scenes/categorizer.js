const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { getCategoriesAsync, getCategoriesAsyncGroupedBy } = require("../spreadsheet");

// this scene handles category entering
const categorizer = new Scene("categorizer");

categorizer.enter(ctx => {
    getCategoriesAsyncGroupedBy(3).then(categories => {        
        categories.push(["/reset"]);
        ctx.reply("Enter category", Markup.keyboard(categories).oneTime().resize().extra());
    }).catch(e => {
        console.log("Cant get grouped categories: " + e)        
    })
});

categorizer.command("reset", ctx => {
    ctx.scene.enter("main");
});

categorizer.on("message", ctx => {
    var category = ctx.message.text.toLowerCase();
    getCategoriesAsync().then(categories => {
        var idx = categories.findIndex(c => c.toLowerCase() === category);
        if (idx !== -1) {
            category = categories[idx];
            ctx.session.expenseCategory = category;
            ctx.scene.enter("descriptor");
        } else {
            ctx.reply("Invalid category entered, try again")
        }
    }).catch(e => {
        console.warn("Cant get categories: " + e);
    })
})


module.exports = {
    scene: categorizer,
    registerTo: stage => stage.register(categorizer)
};