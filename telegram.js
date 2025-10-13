const TelegramAPI = require('node-telegram-bot-api')
const token = '7610525348:AAH_T84bSniYCIZdXCp97HMjvphtVtwMMeM'
const bot = new TelegramAPI(token, { polling: true })

bot.on('message', (msg) => {
    const chatId = msg.chat.id
    const text = msg.text   
    console.log(msg.text)
    
    bot.sendMessage(chatId, 'Got your message' + text)

    if (text === 'Жду ответа') {
        bot.sendMessage(chatId, prompt() + "Ответ на ваше сообщения"+ text)
    }
}) 