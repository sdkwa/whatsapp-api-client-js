import SDKWA from '@sdkwa/whatsapp-api-client';

(async () => {
    const sdkwa = new SDKWA({
        apiHost: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    try {
        console.log("Waiting incoming notifications...");
        let response;
        // Poll for notifications
        while (response = await sdkwa.receiveNotification()) {
            const webhookBody = response.body;
            if (webhookBody.typeWebhook === 'incomingMessageReceived') {
                console.log('incomingMessageReceived');
                if (webhookBody.messageData?.textMessageData?.textMessage) {
                    console.log(webhookBody.messageData.textMessageData.textMessage);
                }
                // Confirm WhatsApp message. Each received message must be confirmed to be able to consume next message
                await sdkwa.deleteNotification(response.receiptId);
            } else if (webhookBody.typeWebhook === 'stateInstanceChanged') {
                console.log('stateInstanceChanged');
                console.log(`stateInstance=${webhookBody.stateInstance}`);
            } else if (webhookBody.typeWebhook === 'outgoingMessageStatus') {
                console.log('outgoingMessageStatus');
                console.log(`status=${webhookBody.status}`);
            } else if (webhookBody.typeWebhook === 'deviceInfo') {
                console.log('deviceInfo');
                console.log(`status=${webhookBody.deviceData}`);
            }
        }
    } catch (ex) {
        console.error(ex.toString());
    }

    console.log("End");
})();