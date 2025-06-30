# SDKWA WhatsApp API Client for JavaScript

[![build](https://github.com/sdkwa/whatsapp-api-client-js/actions/workflows/build.yml/badge.svg)](https://github.com/sdkwa/whatsapp-api-client-js/actions/workflows/build.yml)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/sdkwa/whatsapp-api-client-js/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/@sdkwa%2Fwhatsapp-api-client.svg)](https://www.npmjs.com/package/@sdkwa/whatsapp-api-client)

A modern JavaScript/TypeScript SDK for integrating with the [SDKWA WhatsApp HTTP API](https://sdkwa.pro).  
Easily send and receive WhatsApp messages, files, and notifications from Node.js, browser, or any JavaScript environment.

---

## Features

- Send WhatsApp messages, media, and files
- Receive notifications and webhooks
- Supports Node.js, browser, and TypeScript
- Simple, promise-based API
- Compatible with Express for webhook handling

---

## Installation

**Node.js / npm:**
```sh
npm install @sdkwa/whatsapp-api-client
```

**Browser:**
```html
<script src="https://unpkg.com/@sdkwa/whatsapp-api-client/lib/whatsapp-api-client.browser.js"></script>
<script>
  const sdkwa = new window.SDKWA({
    idInstance: "YOUR_ID_INSTANCE",
    apiTokenInstance: "YOUR_API_TOKEN_INSTANCE"
  });
  sdkwa.sendMessage({ chatId: "79999999999@c.us", message: "Hello from browser!" })
    .then(console.log)
    .catch(console.error);
</script>
```

---

## Quick Start

### Node.js / JavaScript

```javascript
import SDKWA from "@sdkwa/whatsapp-api-client";

const sdkwa = new SDKWA({
  apiHost: "https://api.sdkwa.pro",
  idInstance: "YOUR_ID_INSTANCE",
  apiTokenInstance: "YOUR_API_TOKEN_INSTANCE"
});

(async () => {
  const response = await sdkwa.sendMessage({
    chatId: "79999999999@c.us",
    message: "Hello from SDKWA!"
  });
  console.log(response);
})();
```

### Express Webhook Example

```javascript
import express from "express";
import SDKWA from "@sdkwa/whatsapp-api-client";

const app = express();
app.use(express.json());

const sdkwa = new SDKWA({
  idInstance: process.env.ID_INSTANCE,
  apiTokenInstance: process.env.API_TOKEN_INSTANCE
});

sdkwa.webhookHandler.onIncomingMessageText((data) => {
  console.log("Received message:", data);
});

app.post("/webhook", sdkwa.webhookHandler.webhookHandler());

app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});
```