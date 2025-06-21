import whatsAppClient from '@basisapi/whatsapp-api-client'

// Send WhatsApp message
(async () => {
    const restAPI = whatsAppClient.restAPI(({
        host: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    }))
    try {
        await restAPI.webhookService.startReceivingNotifications()
        restAPI.webhookService.onReceivingMessageText((body) => {
            console.log(body)
            restAPI.webhookService.stopReceivingNotifications();
            console.log("Notifications is about to stop in 20 sec if no messages will be queued...")
        })
        restAPI.webhookService.onReceivingDeviceStatus((body) => {
            console.log(body)
        })
        restAPI.webhookService.onReceivingAccountStatus((body) => {
            console.log(body)
        })
    } catch (ex) {
        console.log(ex.toString());
    }
})();