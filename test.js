const telegramApi = require('node-telegram-bot-api')
const tok  = 'token'
const bot = new telegramApi(tok)

bot.on('message', (msg) => {
  const chatid = msg.chat.id
  const text = msg.text

  bot.sendMessage(chatid, `${text} u said`)
} )



=> testtext
<= testtext u said