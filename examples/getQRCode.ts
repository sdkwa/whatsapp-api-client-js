import SDKWA from '@sdkwa/whatsapp-api-client';

(async () => {
    const sdkwa = new SDKWA({
        apiHost: process.env.API_HOST,
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    try {
        const response = await sdkwa.getQr();
        console.log(response);
    } catch (ex) {
        console.log(ex.toString());
    }
})();