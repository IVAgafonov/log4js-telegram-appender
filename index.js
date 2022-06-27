const axios = require("axios");
const os = require("os");

const telegramAppender = {
    configure(config) {
        let link = null;
        const source = config.source + '@' + os.hostname();
        if (config.link) {
            link = config.link.replaceAll('{{source}}', source);
        }
        return (loggingEvent) => {
            if (config.levels && !config.levels.includes(loggingEvent.level.levelStr)) {
                return;
            }

            let message = `Error from: <i>${source}</i>:
${loggingEvent.data[0].slice(0, 255)}
`;
            if (link) {
                message += `<a href="${link}">link</a>`;
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
