const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Replace 'YOUR_API_TOKEN' with your actual bot API token
const bot = new TelegramBot('6176645541:AAEECHVv6baYPO5QFArhXeAwWc_SEw3QHTE', { polling: true });

// This object will hold the user's pending question before sending to Omnidesk
const pendingQuestions = {};

// Listen for /menu command
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;

  // Create inline keyboard with menu buttons
  const keyboard = {
    inline_keyboard: [
      [{ text: 'Перейти на сайт', url: 'https://omnidesk.ru/' }],
      [{ text: 'Каталог', callback_data: 'option2' }],
      [{ text: 'Связаться с поддержкой', callback_data: 'contact_support' }]
    ]
  };

  // Send message with inline keyboard
  bot.sendMessage(chatId, 'Choose an option from the menu:', {
    reply_markup: JSON.stringify(keyboard)
  });
});

// Listen for callback queries (button clicks)
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const option = query.data;

  // Handle the selected option
  if (option === 'option2') {
    // Send option 2 messages
    bot.sendPhoto(chatId, 'https://i5.walmartimages.com/seo/Koala-Inkjet-Glossy-Printer-Paper-for-DIY-Chip-Bag-and-Print-Brochure-Flyer-36lb-Glossy-Photo-Paper-8-5x11-100-Sheets_6f7fe824-2991-4eb0-80b6-8753da428907.4a3f88c0519026d52b9557c515acbe2a.jpeg', {
      caption: '1. Бумага А4 100 листов — Цена 100р'
    });

    bot.sendPhoto(chatId, 'https://images.freeimages.com/images/large-previews/310/fountain-pen-1241296.jpg', {
        caption: '2. Ручка — 20р'
      });

    bot.sendPhoto(chatId, 'https://images.freeimages.com/images/large-previews/4ad/coloured-pencils-1427682.jpg', {
        caption: '3. Карандаш — 20р'
      });

  } else if (option === 'contact_support') {
    // Store the chatId as a pending question recipient
    pendingQuestions[chatId] = true;
    
    // Prompt the user to write their question
    bot.sendMessage(chatId, 'Write your question, and we will respond shortly.');
  }

  // Answer the callback query to remove the "Loading" animation
  bot.answerCallbackQuery(query.id);
});

// Listen for regular text messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if the user is a pending question recipient
  if (pendingQuestions[chatId]) {
    // Send the question to Omnidesk
    sendQuestionToOmnidesk(chatId, messageText);
    
    // Inform the user that their question has been sent
    bot.sendMessage(chatId, 'Your question has been sent to support. We will respond shortly.');
    
    // Remove the user from pending recipients
    delete pendingQuestions[chatId];
  }
});

// Function to send question to Omnidesk
function sendQuestionToOmnidesk(chatId, messageText) {
  const postData = {
    message: {
      text: messageText
    }
  };

  axios.post('https://telegramwh.omnidesk.ru/webhooks/telegram/4229/697b9818fba6ebf4', postData)
    .then(response => {
      if (response.data.success === '2') {
        console.log('Failed to send question to Omnidesk');
      } else if (response.data.success) {
        console.log('Question sent to Omnidesk successfully');
      }
    })
    .catch(error => {
      console.error('Error sending question to Omnidesk:', error.message);
    });
}