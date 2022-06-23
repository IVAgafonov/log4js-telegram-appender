const axios = require("axios");
const os = require("os");

const telegramAppender = {
    configure(config) {
        return (loggingEvent) => {
            if (loggingEvent.level.level !== 40000) {
                return;
            }
            const source = config.source + '@' + os.hostname();
            let message = `Error from: <i>${source}</i>:
${loggingEvent.data[0].slice(0, 255)}
`;
            if (config.link) {
                message += `<a href="${config.link}source%3A\\` + source + `\+AND+level%3A+\ERROR\&rangetype=relative&from=18000">link</a>`;
            }
            const params = {
                chat_id: config.chatId,
                parse_mode: "HTML",
                text: message,
            };
            axios.post(`https://api.telegram.org/bot${config.botToken}/sendMessage`, params)
                .catch(e => console.log(e.data || e));
        }
    }
}

exports.configure = telegramAppender.configure;
