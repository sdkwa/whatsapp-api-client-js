import express from "express";
import SDKWA from '@sdkwa/whatsapp-api-client';

// Send message and receive webhook
(async () => {
    try {
        const sdkwa = new SDKWA({
            apiHost: process.env.API_HOST,
            idInstance: process.env.ID_INSTANCE,
            apiTokenInstance: process.env.API_TOKEN_INSTANCE
        });

        // Optionally set webhook URL via API if your backend supports it
        // await sdkwa.setSettings({ webhookUrl: 'http://your-server:3000/webhooks' });

        const app = express();
        app.use(express.json());

        // Register webhook handler
        sdkwa.webhookHandler.onIncomingMessageText((data) => {
            console.log('Received incoming text message:', data);
        });

        app.post('/webhooks', sdkwa.webhookHandler.webhookHandler());

        app.listen(3000, async () => {
            console.log(`Started. App listening on port 3000!`);

            // Send a test message
            const response = await sdkwa.sendMessage({
                chatId: "79999999999@c.us",
                message: "hello world"
            });
            console.log('Sent message:', response);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();