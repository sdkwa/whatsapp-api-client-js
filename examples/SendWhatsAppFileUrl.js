import whatsAppClient from '@basisapi/whatsapp-api-client'

// Send WhatsApp file
(async () => {
    const restAPI = whatsAppClient.restAPI(({
        host: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    }))
    try {
        const response = await restAPI.file.sendFileByUrl("79999999999@c.us", null, 'https://avatars.mds.yandex.net/get-pdb/477388/77f64197-87d2-42cf-9305-14f49c65f1da/s375', 'horse.png', 'horse');
        console.log(response.idMessage)
    } catch (ex) {
        console.log(ex.toString());
    }
    
})();