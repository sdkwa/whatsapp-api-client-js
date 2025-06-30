import SDKWA from '@sdkwa/whatsapp-api-client';

(async () => {
    const sdkwa = new SDKWA({
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE
    });

    try {
        const response = await sdkwa.createGroup(
            'My group',
            ['79999999999@c.us', '71234567890@c.us']
        );
        console.log(response);
    } catch (ex) {
        console.log(ex.toString());
    }
})();