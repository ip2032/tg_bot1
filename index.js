const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const token = '6690218397:AAGLDnPBafJ-SB7trqcPUXeJf5zWh_viYOg'

const bot = new TelegramApi (token, { polling: true })

const chats = {}

const startGame = async(chatId) => {
    await bot.sendMessage (chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен ее отгадать`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}
start = () => {
    bot.setMyCommands ([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получать информацию о пользователе'},
        {command: '/game', description: 'Сыграть в игру'},
    ])
    

    //прописываем логику для каждой команды

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
    
        if (text === '/start') {
            await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/e78/90b/e7890b10-1c4c-3cd4-a176-4e1010807ace/1.webp')
            return bot.sendMessage(chatId, `Добро пожаловать в службу поддержки SupportCompany`)
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `Вас зовут ${msg.from.first_name} ${msg.from.last_name}`);
        }
        if (text === '/game') {
            return startGame(chatId);
        }
        return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!)');

    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data === '/again'){
            return startGame(chatId)
        }
        if (data === chats[chatId]){
            return bot.sendMessage(chatId, `Поздравляю, ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `К сожалению, ты не угадал — бот загадал ${chats[chatId]}`, againOptions)
        }
    })
}

start ()