import SDKWA from '@sdkwa/whatsapp-api-client';

// Send WhatsApp message
(async () => {
    const sdkwa = new SDKWA({
        apiHost: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    try {
        const response = await sdkwa.sendMessage({
            chatId: "79999999999@c.us",
            message: "hello world"
        });
        console.log(response.idMessage);
    } catch (ex) {
        console.log(ex.toString());
    }
})();
