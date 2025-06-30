import SDKWA from '@sdkwa/whatsapp-api-client';
import * as fs from 'fs';

// Send WhatsApp file
(async () => {
    const sdkwa = new SDKWA({
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    const fileBuffer = fs.readFileSync('hello.txt');

    const response = await sdkwa.sendFileByUpload({
        chatId: '7xxxxxxxxxx@c.us',
        caption: 'My file',
        file: fileBuffer,
        fileName: 'hello.txt'
    });

    console.log(`file uploaded ${response.idMessage}`);
})();