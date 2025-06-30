import SDKWA from '@sdkwa/whatsapp-api-client';

// Send WhatsApp file by URL
(async () => {
    const sdkwa = new SDKWA({
        apiHost: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    try {
        const response = await sdkwa.sendFileByUrl({
            chatId: "79999999999@c.us",
            urlFile: 'https://surepulse-images.s3.us-east-1.amazonaws.com/uploads/photos/24dd013f7b5d4427af70bfd027eb2b2814ea3d9e-1015-rbawyoming1.jpg',
	        fileName: "window.jpg",
            caption: 'window'
        });
        console.log(response.idMessage);
    } catch (ex) {
        console.log(ex.toString());
    }
})();