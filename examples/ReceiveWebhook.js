import whatsAppClient from '@basisapi/whatsapp-api-client'
import express from "express";
import bodyParser from 'body-parser';

// Send message and receive webhook
(async () => {
    try {

        await restAPI.settings.setSettings({
            webhookUrl: '/webhooks'
        });

        const app = express();
        app.use(bodyParser.json());
        const webHookAPI = whatsAppClient.webhookAPI(app, '/webhooks')

        webHookAPI.onIncomingMessageText((data, idInstance, idMessage, sender, typeMessage, textMessage) => {
            console.log(`outgoingMessage data ${data.toString()}`)
        });

        app.listen(3000, async () => {
            console.log(`Started. App listening on port 3000!`)

            const restAPI = whatsAppClient.restAPI(({
                host: process.env.API_HOST,
                idInstance: process.env.ID_INSTANCE,
                apiTokenInstance: process.env.API_TOKEN_INSTANCE
            }));
    
            const response = await restAPI.message.sendMessage(null, 79999999999, "hello world");
    
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();

