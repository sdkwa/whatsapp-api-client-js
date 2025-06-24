type WebhookType =
  | "stateInstanceChanged"
  | "outgoingMessageStatus"
  | "incomingMessageReceived_textMessage"
  | "incomingMessageReceived_imageMessage"
  | "incomingMessageReceived_locationMessage"
  | "incomingMessageReceived_contactMessage"
  | "incomingMessageReceived_extendedTextMessage"
  | "deviceInfo";

type WebhookCallback = (data: any, ...args: any[]) => void;

export class WebhookHandler {
  private _webhookCallbacks: Map<WebhookType, WebhookCallback> = new Map();

  onStateInstance(callback: WebhookCallback) {
    this._webhookCallbacks.set("stateInstanceChanged", callback);
  }
  onOutgoingMessageStatus(callback: WebhookCallback) {
    this._webhookCallbacks.set("outgoingMessageStatus", callback);
  }
  onIncomingMessageText(callback: WebhookCallback) {
    this._webhookCallbacks.set("incomingMessageReceived_textMessage", callback);
  }
  onIncomingMessageFile(callback: WebhookCallback) {
    this._webhookCallbacks.set("incomingMessageReceived_imageMessage", callback);
  }
  onIncomingMessageLocation(callback: WebhookCallback) {
    this._webhookCallbacks.set("incomingMessageReceived_locationMessage", callback);
  }
  onIncomingMessageContact(callback: WebhookCallback) {
    this._webhookCallbacks.set("incomingMessageReceived_contactMessage", callback);
  }
  onIncomingMessageExtendedText(callback: WebhookCallback) {
    this._webhookCallbacks.set("incomingMessageReceived_extendedTextMessage", callback);
  }
  onDeviceInfo(callback: WebhookCallback) {
    this._webhookCallbacks.set("deviceInfo", callback);
  }

  /**
   * Express middleware to handle webhook POSTs.
   * Usage: app.post('/webhook', webhookHandlerInstance.webhookHandler())
   */
  webhookHandler() {
    return (req: any, res: any, next: any) => {
      try {
        const body = req.body;
        let webhookType: WebhookType | undefined;
        if (body.messageData && body.messageData.typeMessage) {
          webhookType = `${body.typeWebhook}_${body.messageData.typeMessage}` as WebhookType;
        } else {
          webhookType = body.typeWebhook as WebhookType;
        }
        const callback = this._webhookCallbacks.get(webhookType);
        if (callback) {
          callback(body);
        }
        res.send();
      } catch (err) {
        next(err);
      }
    };
  }
}

export type { WebhookType, WebhookCallback };