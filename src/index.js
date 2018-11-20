
const Telegraf = require("telegraf");
const session = require("telegraf/session");
const Stage = require("telegraf/stage");
const { fillCacheValues } = require("./spreadsheet");


// register all the scenes in stage
// add entry path: main -> currency-setter -> categorizer -> descriptor -> sender -> main
// exchange currencies path: main -> exchanger -> main
// refresh path: main -> refresher -> main
// blocker path: main -> blocker
const stage = new Stage();

require("./scenes/blocker").registerTo(stage);
require("./scenes/sender").registerTo(stage);
require("./scenes/descriptor").registerTo(stage);
require("./scenes/main").registerTo(stage);
require("./scenes/categorizer").registerTo(stage);
require("./scenes/refresher").registerTo(stage);
require("./scenes/currency-setter").registerTo(stage);
require("./scenes/exchanger").registerTo(stage);



const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());
bot.on("message", ctx => {
    ctx.scene.enter(ctx.message.from.id == process.env.TELEGRAM_USER_ID ? "main" : "blocker")
});



console.log("Filling cache values...");
fillCacheValues().then(() => {
    console.log("Starting bot...");
    bot.startPolling();
    console.log("Ready");
});





