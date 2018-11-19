## What does this telegram bot do?

I use Google Spreadsheet to keep track of my budget. While it's completely fine when I'm at home and have access to my PC or laptop, it's not very convenient to add new entries on the go. This bot helps me to solve this problem by providing quick and painless process of recording my expenses.

## How to use it?

Your spreadsheet should contain at least two sheets. First one contains a list of all expense categories in its first column (other columns are free to use for other things like statistics and stuff). To the second sheet all the expenses will be written, category to first column, amount to second, description (if any) to third and date to fourth.
Names of those lists can be specified via environment variables.


1. Run it somewhere on your server
2. `/start`
3. Type in expense amount
4. Type in category of the expense or `/reset` to return to step 3.
5. Type in description of the expense or just `/skip` it. Also `/reset` brings you back to step 3.
6. That's it, current expense is sent to server! You're back at step 3.  

![Entering category](.github/category.png)
![Expense sent](.github/sent.png)

## Configuration

The bot requires next environment variables:

* `BOT_TOKEN` — telegram bot token (received via `@BotFather`) 
* `TELEGRAM_USER_ID` — id of your telegram account (you can find it out using `@MyTelegramID_bot`)
* `SPREADSHEET_KEY` — long set of symbols in URL of your spreadsheet
* `CREDENTIALS_PATH` — path to credentials relative to workdir (instructions how to get it [here](https://www.npmjs.com/package/google-spreadsheet))
* `TARGET_SHEET_TITLE` — name of the sheet, where your current expenses go
* `CATEGORIES_SHEET_TITLE` — name of the sheet, in first column of which categories are stored

Example of a Dockerfile: 
```docker
FROM node:8-alpine

WORKDIR /

COPY . /

ENV BOT_TOKEN your_bot_toker
ENV TELEGRAM_USER_ID your_user_id
ENV SPREADSHEET_KEY spreadsheet_key
ENV CREDENTIALS_PATH credentials_path
ENV TARGET_SHEET_TITLE name
ENV CATEGORIES_SHEET_TITLE name

CMD ["node", "src/index"]
```