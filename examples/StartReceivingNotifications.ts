import SDKWA from '@sdkwa/whatsapp-api-client';
import express from 'express';

// Start receiving WhatsApp notifications using webhook handler
(async () => {
    const sdkwa = new SDKWA({
        apiHost: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    // Set up Express server to receive webhooks

    const app = express();
    app.use(express.json());

    // Register webhook handlers
    sdkwa.webhookHandler.onIncomingMessageText((body) => {
        console.log(body);
        // You can implement logic to stop server or notifications here if needed
        console.log("Received text message. You can stop notifications if needed.");
    });
    sdkwa.webhookHandler.onDeviceInfo((body) => {
        console.log(body);
    });
    sdkwa.webhookHandler.onStateInstance((body) => {
        console.log(body);
    });

    app.post('/webhook', sdkwa.webhookHandler.webhookHandler());

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Webhook server listening on port ${PORT}`);
    });
})();