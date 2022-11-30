const axios = require("axios");
const os = require("os");

const msgHM = new Map();

const telegramAppender = {
    configure(config) {
        let link = null;
        const source = config.source + '@' + os.hostname();
        const ttlCache = config.ttl || 60;

        setInterval(() => {
            for (const m of msgHM.entries()) {
                if (m[1] < new Date - ttlCache * 60 * 1000) {
                    msgHM.delete(m[0]);
                }
            }
        }, 10 * 60 * 1000);

        if (config.link) {
            link = config.link.replaceAll('{{source}}', source);
        }
        return (loggingEvent) => {
            const textMessage = loggingEvent.data[0].slice(0, 255);

            if (config.levels && !config.levels.includes(loggingEvent.level.levelStr)) {
                return;
            }
            if (msgHM.has(textMessage)) {
                console.log(`Message was sent recently`);
                return;
            }
            msgHM.set(textMessage, new Date());

            let message = `Error from: <i>${source}</i>:
${textMessage}
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
