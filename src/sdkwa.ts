import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
// Add these imports for SSL skipping
import https from 'https';

export interface SDKWAOptions {
  apiHost?: string; // Make apiHost optional
  idInstance: string;
  apiTokenInstance: string;
  userId?: string;
  userToken?: string;
}

export interface SendMessageParams {
  chatId: string;
  message: string;
  quotedMessageId?: string;
  archiveChat?: boolean;
  linkPreview?: boolean;
}
export interface SendMessageResponse {
  idMessage: string;
}

export interface SendContactParams {
  chatId: string;
  contact: {
    phoneContact: number;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    company?: string;
  };
  quotedMessageId?: string;
}
export interface SendContactResponse {
  idMessage: string;
}

export interface SendFileByUploadParams {
  chatId: string;
  file: Buffer | Blob | File;
  fileName: string;
  caption?: string;
  quotedMessageId?: string;
}
export interface SendFileByUploadResponse {
  idMessage: string;
}

export interface SendFileByUrlParams {
  chatId: string;
  urlFile: string;
  fileName: string;
  caption?: string;
  quotedMessageId?: string;
  archiveChat?: boolean;
}
export interface SendFileByUrlResponse {
  idMessage: string;
}

export interface SendLocationParams {
  chatId: string;
  nameLocation?: string;
  address?: string;
  latitude: number;
  longitude: number;
  quotedMessageId?: string;
}
export interface SendLocationResponse {
  idMessage: string;
}

export interface UploadFileResponse {
  urlFile: string;
}

export interface GetChatHistoryParams {
  chatId: string;
  count?: number;
}
export type GetChatHistoryResponse = any[];

export interface GetAuthorizationCodeParams {
  phoneNumber: number;
}
export interface GetAuthorizationCodeResponse {
  status: boolean;
  code: string;
}

export interface ErrorResponse {
  statusCode?: number;
  timestamp?: string;
  path?: string;
  message: string;
}

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

export class SDKWA {
  private apiHost: string;
  private idInstance: string;
  private apiTokenInstance: string;
  private userId?: string;
  private userToken?: string;
  private basePath: string;
  private headers: Record<string, string>;
  private axiosInstance: AxiosInstance;

  private _webhookCallbacks: Map<WebhookType, WebhookCallback> = new Map();

  constructor({ apiHost, idInstance, apiTokenInstance, userId, userToken }: SDKWAOptions) {
    // Validate required options
    if (!idInstance || typeof idInstance !== 'string' || idInstance.trim() === '') {
      throw new Error('SDKWAOptions: idInstance is required and must be a non-empty');
    }
    if (!apiTokenInstance || typeof apiTokenInstance !== 'string' || apiTokenInstance.trim() === '') {
      throw new Error('SDKWAOptions: apiTokenInstance is required and must be a non-empty');
    }
    // Optional: userId and userToken are only checked in methods where needed

    // Set default host if not provided
    this.apiHost = (apiHost ?? 'https://api.sdkwa.pro').replace(/\/$/, '');
    this.idInstance = idInstance;
    this.apiTokenInstance = apiTokenInstance;
    this.userId = userId;
    this.userToken = userToken;
    this.basePath = `/whatsapp/${idInstance}`;
    this.headers = {
      'Authorization': `Bearer ${apiTokenInstance}`,
      'Content-Type': 'application/json'
    };
    // Always skip SSL check
    const agent = new https.Agent({ rejectUnauthorized: false });
    this.axiosInstance = axios.create({
      baseURL: this.apiHost,
      headers: this.headers,
      httpsAgent: agent
    });
  }

  private async _request<T>(
    method: string,
    path: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, string | number>;
      formData?: FormData;
      isForm?: boolean;
      isBinary?: boolean;
    } = {}
  ): Promise<T> {
    let url = path;
    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      headers: {
        ...this.headers,
        ...options.headers,
        // Always ensure Authorization header is set with Bearer token
        'Authorization': `Bearer ${this.apiTokenInstance}`
      },
      params: options.params,
      responseType: options.isBinary ? 'arraybuffer' : 'json'
    };

    if (options.isForm && options.formData) {
      config.data = options.formData;
      // Let axios set the correct Content-Type for FormData
      delete config.headers!['Content-Type'];
    } else if (options.body) {
      config.data = options.body;
    }

    const res: AxiosResponse = await this.axiosInstance.request(config);

    if (options.isBinary) {
      return res.data as any;
    }
    return res.data as T;
  }

  // --- Account methods ---
  async getSettings(): Promise<any> {
    return this._request('GET', `${this.basePath}/getSettings`);
  }

  async setSettings(settings: Record<string, any>): Promise<{ saveSettings: boolean }> {
    return this._request('POST', `${this.basePath}/setSettings`, { body: settings });
  }

  async getStateInstance(): Promise<{ stateInstance: string }> {
    return this._request('GET', `${this.basePath}/getStateInstance`);
  }

  async getWarmingPhoneStatus(): Promise<any> {
    return this._request('GET', `${this.basePath}/getWarmingPhoneStatus`);
  }

  async reboot(): Promise<{ isReboot: boolean }> {
    return this._request('GET', `${this.basePath}/reboot`);
  }

  async logout(): Promise<{ isLogout: boolean }> {
    return this._request('GET', `${this.basePath}/logout`);
  }

  async getQr(): Promise<{ type: string; message: string }> {
    return this._request('GET', `${this.basePath}/qr`);
  }

  async getAuthorizationCode(params: GetAuthorizationCodeParams): Promise<GetAuthorizationCodeResponse | ErrorResponse> {
    return this._request('POST', `${this.basePath}/getAuthorizationCode`, { body: params });
  }

  async requestRegistrationCode(params: { phoneNumber: number; method: 'sms' | 'voice' }): Promise<any> {
    return this._request('POST', `${this.basePath}/requestRegistrationCode`, { body: params });
  }

  async sendRegistrationCode(params: { code: string }): Promise<any> {
    return this._request('POST', `${this.basePath}/sendRegistrationCode`, { body: params });
  }

  // --- Sending methods ---
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return this._request('POST', `${this.basePath}/sendMessage`, { body: params });
  }

  async sendContact(params: SendContactParams): Promise<SendContactResponse> {
    return this._request('POST', `${this.basePath}/sendContact`, { body: params });
  }

  async sendFileByUpload(params: SendFileByUploadParams): Promise<SendFileByUploadResponse> {
    const formData = new FormData();
    formData.append('chatId', params.chatId);
    // Fix: Convert Buffer to Blob for browser/node-fetch compatibility
    let fileToSend: Blob | File;
    if (typeof Buffer !== "undefined" && params.file instanceof Buffer) {
      fileToSend = new Blob([params.file]);
      formData.append('file', fileToSend, params.fileName);
    } else {
      formData.append('file', params.file as Blob | File, params.fileName);
    }
    if (params.caption) formData.append('caption', params.caption);
    if (params.quotedMessageId) formData.append('quotedMessageId', params.quotedMessageId);
    return this._request('POST', `${this.basePath}/sendFileByUpload`, { formData, isForm: true });
  }

  async sendFileByUrl(params: SendFileByUrlParams): Promise<SendFileByUrlResponse> {
    return this._request('POST', `${this.basePath}/sendFileByUrl`, { body: params });
  }

  async sendLocation(params: SendLocationParams): Promise<SendLocationResponse> {
    return this._request('POST', `${this.basePath}/sendLocation`, { body: params });
  }

  async uploadFile(file: Buffer | Blob | File): Promise<UploadFileResponse> {
    const formData = new FormData();
    // Fix: Convert Buffer to Blob for browser/node-fetch compatibility
    let fileToSend: Blob | File;
    if (typeof Buffer !== "undefined" && file instanceof Buffer) {
      fileToSend = new Blob([file]);
      formData.append('file', fileToSend);
    } else {
      formData.append('file', file as Blob | File);
    }
    return this._request('POST', `${this.basePath}/uploadFile`, { formData, isForm: true });
  }

  async getChatHistory(params: GetChatHistoryParams): Promise<GetChatHistoryResponse> {
    return this._request('POST', `${this.basePath}/getChatHistory`, { body: params });
  }

  // --- Receiving methods ---
  async receiveNotification(): Promise<any> {
    return this._request('GET', `${this.basePath}/receiveNotification`);
  }

  async deleteNotification(receiptId: number): Promise<{ result: boolean }> {
    return this._request('DELETE', `${this.basePath}/deleteNotification/${receiptId}`);
  }

  // --- Chat/Contact methods ---
  async getContacts(): Promise<any[]> {
    return this._request('GET', `${this.basePath}/getContacts`);
  }

  async getChats(): Promise<any[]> {
    return this._request('GET', `${this.basePath}/getChats`);
  }

  async getContactInfo(chatId: string): Promise<any> {
    return this._request('GET', `${this.basePath}/getContactInfo`, {
      body: { chatId }
    });
  }

  async setProfilePicture(file: Buffer | Blob | File): Promise<{ setProfilePicture: boolean; urlAvatar: string; reason: string }> {
    const formData = new FormData();
    // Fix: Convert Buffer to Blob for browser/node-fetch compatibility
    let fileToSend: Blob | File;
    if (typeof Buffer !== "undefined" && file instanceof Buffer) {
      fileToSend = new Blob([file]);
      formData.append('file', fileToSend);
    } else {
      formData.append('file', file as Blob | File);
    }
    return this._request('POST', `${this.basePath}/setProfilePicture`, { formData, isForm: true });
  }

  async setProfileName(name: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/setProfileName`, { body: { name } });
  }

  async setProfileStatus(status: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/setProfileStatus`, { body: { status } });
  }

  async getAvatar(chatId: string): Promise<any> {
    return this._request('POST', `${this.basePath}/getAvatar`, { body: { chatId } });
  }

  async checkWhatsapp(phoneNumber: number): Promise<{ existsWhatsapp: boolean }> {
    return this._request('POST', `${this.basePath}/checkWhatsapp`, { body: { phoneNumber } });
  }

  // --- Group methods ---
  async updateGroupName(groupId: string, groupName: string): Promise<{ updateGroupName: boolean }> {
    return this._request('POST', `${this.basePath}/updateGroupName`, { body: { groupId, groupName } });
  }

  async getGroupData(groupId: string): Promise<any> {
    return this._request('POST', `${this.basePath}/getGroupData`, { body: { groupId } });
  }

  async leaveGroup(groupId: string): Promise<{ leaveGroup: boolean }> {
    return this._request('POST', `${this.basePath}/leaveGroup`, { body: { groupId } });
  }

  async setGroupAdmin(groupId: string, participantChatId: string): Promise<{ setGroupAdmin: boolean }> {
    return this._request('POST', `${this.basePath}/setGroupAdmin`, { body: { groupId, participantChatId } });
  }

  async removeGroupParticipant(groupId: string, participantChatId: string): Promise<{ removeParticipant: boolean }> {
    return this._request('POST', `${this.basePath}/removeGroupParticipant`, { body: { groupId, participantChatId } });
  }

  async removeAdmin(groupId: string, participantChatId: string): Promise<{ removeAdmin: boolean }> {
    return this._request('POST', `${this.basePath}/removeAdmin`, { body: { groupId, participantChatId } });
  }

  async createGroup(groupName: string, chatIds: string[]): Promise<{ created: boolean; chatId: string; groupInviteLink: string }> {
    return this._request('POST', `${this.basePath}/createGroup`, { body: { groupName, chatIds } });
  }

  async addGroupParticipant(groupId: string, participantChatId: string): Promise<{ addParticipant: boolean }> {
    return this._request('POST', `${this.basePath}/addGroupParticipant`, { body: { groupId, participantChatId } });
  }

  async setGroupPicture(groupId: string, file: Buffer | Blob | File): Promise<{ setGroupPicture: boolean; urlAvatar: string; reason: string }> {
    const formData = new FormData();
    formData.append('groupId', groupId);
    // Fix: Convert Buffer to Blob for browser/node-fetch compatibility
    let fileToSend: Blob | File;
    if (typeof Buffer !== "undefined" && file instanceof Buffer) {
      fileToSend = new Blob([file]);
      formData.append('file', fileToSend);
    } else {
      formData.append('file', file as Blob | File);
    }
    return this._request('POST', `${this.basePath}/setGroupPicture`, { formData, isForm: true });
  }

  // --- Read mark ---
  async readChat(params: { chatId: string; idMessage?: string }): Promise<{ setRead: boolean }> {
    return this._request('POST', `${this.basePath}/readChat`, { body: params });
  }

  // --- Archive/Unarchive ---
  async archiveChat(chatId: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/archiveChat`, { body: { chatId } });
  }

  async unarchiveChat(chatId: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/unarchiveChat`, { body: { chatId } });
  }

  // --- Message deletion ---
  async deleteMessage(chatId: string, idMessage: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/deleteMessage`, { body: { chatId, idMessage } });
  }

  // --- Queue ---
  async clearMessagesQueue(): Promise<{ isCleared: boolean }> {
    return this._request('GET', `${this.basePath}/clearMessagesQueue`);
  }

  async showMessagesQueue(): Promise<any[]> {
    return this._request('GET', `${this.basePath}/showMessagesQueue`);
  }

  // --- Instance Management (user-level) ---
  static async getInstances(apiHost: string, userId: string, userToken: string): Promise<any> {
    if (!userId || !userToken) {
      throw new Error('userId and userToken are required for getInstances');
    }
    const url = `${apiHost}/api/v1/instance/user/instances/list`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'x-user-token': userToken,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  }

  static async createInstance(apiHost: string, userId: string, userToken: string, tariff: string, period: string, paymentType?: string): Promise<any> {
    if (!userId || !userToken) {
      throw new Error('userId and userToken are required for createInstance');
    }
    const url = `${apiHost}/api/v1/instance/user/instance/createByOrder`;
    const body: any = { tariff, period };
    if (paymentType) body.paymentType = paymentType;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'x-user-token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  static async extendInstance(apiHost: string, userId: string, userToken: string, idInstance: number, tariff: string, period: string, paymentType?: string): Promise<any> {
    if (!userId || !userToken) {
      throw new Error('userId and userToken are required for extendInstance');
    }
    const url = `${apiHost}/api/v1/instance/user/instance/extendByOrder`;
    const body: any = { idInstance, tariff, period };
    if (paymentType) body.paymentType = paymentType;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'x-user-token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  static async deleteInstance(apiHost: string, userId: string, userToken: string, idInstance: number): Promise<any> {
    if (!userId || !userToken) {
      throw new Error('userId and userToken are required for deleteInstance');
    }
    const url = `${apiHost}/api/v1/instance/user/instance/delete`;
    const body = { idInstance };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'x-user-token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  static async restoreInstance(apiHost: string, userId: string, userToken: string, idInstance: number): Promise<any> {
    if (!userId || !userToken) {
      throw new Error('userId and userToken are required for restoreInstance');
    }
    const url = `${apiHost}/api/v1/instance/user/instance/restore`;
    const body = { idInstance };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        'x-user-token': userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  // --- Webhook registration methods ---
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
   * Usage: app.post('/webhook', sdkwaInstance.webhookHandler())
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
          // You can expand argument mapping as needed
          callback(body);
        }
        res.send();
      } catch (err) {
        next(err);
      }
    };
  }
}

export default SDKWA;