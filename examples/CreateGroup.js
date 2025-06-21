import whatsAppClient from '@basisapi/whatsapp-api-client'

(async () => {
    const restAPI = whatsAppClient.restAPI(({
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    }))
    try {
        const response = await restAPI.group.createGroup('My group', ['79999999999@c.us, 71234567890@c.us'], null);
        console.log(response.idMessage)
    } catch (ex) {
        console.log(ex.toString());
    }
})();