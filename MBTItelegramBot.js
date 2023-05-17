  const TelegramBot = require('node-telegram-bot-api');
  const axios = require('axios');

  const token = '';
  const mockAPIUrl = '';

  const bot = new TelegramBot(token, {polling: true});

  const mbtiTypes = ['intj', 'intp', 'entj', 'entp', 'infj', 'infp', 'enfj', 'enfp', 'istj', 'isfj', 'estj', 'esfj', 'istp', 'isfp', 'estp', 'esfp'];

  bot.on('message', (msg) => {
    console.log('message received');
    const chatId = msg.chat.id;
    const text = msg.text.toString().toLowerCase();
    console.log(text)

    if (text === "/mbti" || text === "/mbti@mbtigroups_bot") {

      axios.get(mockAPIUrl)
        .then(response => {
          let mbtiCounts = {};
          for (let type of mbtiTypes) {
            mbtiCounts[type] = 0;
          }
          for (let user of response.data) {
            if (mbtiTypes.includes(user.mbti)) {
              mbtiCounts[user.mbti]++;
            }
          }

          let message = `عشان تضيف نفسك لنمط اكتب سلاش ام بي تي اي ثم نمطك زي كذا 
          
          /mbti intp

          عشان تسوي منشن لكل اللي بالنمط سوي بس سلاش النمط

          /intp

             عدد الانماط في القروب حاليا
             (بس اللي مسجلين مع البوت)`;
          for (let type of mbtiTypes) {
            message += `\n ${type.toUpperCase()}: ${mbtiCounts[type]} `;
          }

          bot.sendMessage(chatId, message);
        })
        .catch(error => {
          console.error(error);
          bot.sendMessage(chatId, 'في خطاء @riyanmadao صلحني');
        });

      return;
    }
    

    if (text.startsWith("/mbti")) {
      let mbti = text.split(" ")[1];
        
      if (!mbtiTypes.includes(mbti)) {
        bot.sendMessage(chatId, `@${msg.from.username} "/mbti intp" حط نمط صح زي `);
        return;
      }
      let user = {
        id: msg.from.id,
        username: msg.from.username,
        mbti: mbti
      };

      axios.get(`${mockAPIUrl}?username=${user.username}`)
        .then(response => {
          if (response.data.length > 0) {
            let existingUser = response.data[0];
            existingUser.mbti = mbti;

            axios.put(`${mockAPIUrl}/${existingUser.id}`, existingUser)
              .then(response => {
                bot.sendMessage(chatId, `@${user.username} تم تعديل نوع MBTI بنجاح`);
              })
              .catch(error => {
                console.error(error);
                bot.sendMessage(chatId, 'في خطاء @riyanmadao صلحني');
              });
          } else {
            axios.post(mockAPIUrl, user)
              .then(response => {
                bot.sendMessage(chatId, `@${user.username} تم حفظ نوع MBTI بنجاح`);
              })
              .catch(error => {
                console.error(error);
                bot.sendMessage(chatId, 'في خطاء @riyanmadao صلحني');
              });
          }
        })
        .catch(error => {
          console.error(error);
          bot.sendMessage(chatId, 'حدث خطأ أثناء التحقق من وجود الشخص  ');
        });
    } else if (text.startsWith('/')) {
      let mbti = text.slice(1);

      if (!mbtiTypes.includes(mbti)) {
        return;
      }

      axios.get(mockAPIUrl)
        .then(response => {
          let message = mbti.toUpperCase() + 's الو يا ';
          for (let user of response.data) {
            if (user.mbti === mbti) {
              message += `@${user.username} `;
            }
            
          }
          //if no one in the group has the mbti type send no one has this type
          if(message === mbti.toUpperCase() + 's الو يا '){
            bot.sendMessage(chatId, `ما في احد عنده نمط
            ${mbti}
            بالقروب`);

          }
          else{
          bot.sendMessage(chatId, message);}
        })
        .catch(error => {
          console.error(error);
          bot.sendMessage(chatId, 'في خطاء @riyanmadao صلحني');
        });
    }
  });
