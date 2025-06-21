import whatsAppClient from '@basisapi/whatsapp-api-client'

// Send WhatsApp file
(async () => {
    const restAPI = whatsAppClient.restAPI(({
        idInstance: '1101000001',
        apiTokenInstance: '8e331e3ff82ded9091c1a35a72bddef1320ed9ab80b08667'
    }))
    try {
        const response = await restAPI.message.sendButtons("79999999999@c.us", "Hello", "Please choose the color:", [{"buttonId": "1", "buttonText": "green"}, {"buttonId": "2", "buttonText": "red"}, {"buttonId": "3", "buttonText": "blue"}]);
        console.log(response.idMessage)
    } catch (ex) {
        console.log(ex.toString());
    }
})();