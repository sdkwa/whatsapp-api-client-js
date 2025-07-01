import SDKWA from '@sdkwa/whatsapp-api-client';

(async () => {
    const sdkwa = new SDKWA({
        idInstance: process.env.ID_INSTANCE,
        apiTokenInstance: process.env.API_TOKEN_INSTANCE,
        userId: process.env.USER_ID,
        userToken: process.env.USER_TOKEN,
    });
    const instances = await sdkwa.getInstances();
    const result = await sdkwa.createInstance("DEVELOPER", "infinitely");
})();
