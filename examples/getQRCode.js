import whatsAppClient from '@basisapi/whatsapp-api-client'

// Send WhatsApp file
(async () => {
    const restAPI = whatsAppClient.restAPI(({
        host: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    }))
    const response = await restAPI.instance.qr();
})();