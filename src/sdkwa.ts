import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import https from 'https';
import { WebhookHandler, WebhookType, WebhookCallback } from './webhook-handler';

export interface SDKWAOptions {
  apiHost?: string; 
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

class SDKWA {
  private apiHost: string;
  private idInstance: string;
  private apiTokenInstance: string;
  private userId?: string;
  private userToken?: string;
  private basePath: string;
  private headers: Record<string, string>;
  private axiosInstance: AxiosInstance;

  public webhookHandler: WebhookHandler;

  constructor({ apiHost, idInstance, apiTokenInstance, userId, userToken }: SDKWAOptions) {
    // Validate required options
    if (!idInstance || typeof idInstance !== 'string' || idInstance.trim() === '') {
      throw new Error('SDKWAOptions: idInstance is required and must be a non-empty');
    }
    if (!apiTokenInstance || typeof apiTokenInstance !== 'string' || apiTokenInstance.trim() === '') {
      throw new Error('SDKWAOptions: apiTokenInstance is required and must be a non-empty');
    }

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

    if (https) {
      // browser don't have https module, so we check if it exists
      const agent = new https.Agent({ rejectUnauthorized: false });
      this.axiosInstance = axios.create({
        baseURL: this.apiHost,
        headers: this.headers,
        httpsAgent: agent
      });
    } else {
      this.axiosInstance = axios.create({
        baseURL: this.apiHost,
        headers: this.headers,
      });
    }

    this.webhookHandler = new WebhookHandler();
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

  /**
   * Get current account settings
   * 
   * This method retrieves the current settings for the specified account instance, 
   * including webhook configuration, message delay, and notification preferences.
   * 
   * @returns Current account settings including webhook URL, delays, and notification settings
   */
  async getSettings(): Promise<any> {
    return this._request('GET', `${this.basePath}/getSettings`);
  }

  /**
   * Set account settings
   * 
   * This method updates the account settings for the specified instance. When this method is called, 
   * the account is rebooted. You can specify any combination of settings parameters; 
   * at least one parameter must be provided.
   * 
   * @param settings - Settings object containing webhook URL, delays, notification preferences, etc.
   * @returns Flag indicating whether settings were successfully saved
   */
  async setSettings(settings: Record<string, any>): Promise<{ saveSettings: boolean }> {
    return this._request('POST', `${this.basePath}/setSettings`, { body: settings });
  }

  /**
   * Get account state
   * 
   * This method retrieves the current state of the account instance. Possible states include:
   * - `notAuthorized`: The account is not authorized. See the QR code authorization instructions.
   * - `authorized`: The account is authorized and ready to use.
   * - `blocked`: The account is banned.
   * - `starting`: The account is starting up or in maintenance mode.
   * 
   * @returns Current state of the account instance
   */
  async getStateInstance(): Promise<{ stateInstance: string }> {
    return this._request('GET', `${this.basePath}/getStateInstance`);
  }

  /**
   * Get warming phone status
   * 
   * The method gets the account warming state, including warming type, status percentage,
   * and information about warmed/not warmed phones.
   * 
   * @returns Account warming status and statistics
   */
  async getWarmingPhoneStatus(): Promise<any> {
    return this._request('GET', `${this.basePath}/getWarmingPhoneStatus`);
  }

  /**
   * Reboot account
   * 
   * This method reboots the specified WhatsApp account instance.
   * 
   * @returns Flag indicating whether the WhatsApp account was successfully rebooted
   */
  async reboot(): Promise<{ isReboot: boolean }> {
    return this._request('GET', `${this.basePath}/reboot`);
  }

  /**
   * Logout account
   * 
   * This method logs out the specified WhatsApp account instance.
   * 
   * @returns Flag indicating whether the WhatsApp account was successfully logged out
   */
  async logout(): Promise<{ isLogout: boolean }> {
    return this._request('GET', `${this.basePath}/logout`);
  }

  /**
   * Get QR code for account authorization
   * 
   * This method returns a QR code for authorizing your WhatsApp account. 
   * Scan the QR code using the WhatsApp Business app on your phone. 
   * The QR code is updated every 20 seconds, so it is recommended to request this method with a 1-second delay. 
   * If the account is already authorized, you must log out before requesting a new QR code.
   * 
   * @returns QR code as base64 image or status message
   */
  async getQr(): Promise<{ type: string; message: string }> {
    return this._request('GET', `${this.basePath}/qr`);
  }

  /**
   * Get authorization code for account authorization
   * 
   * This method is used to authorize an instance by phone number as an alternative to QR code authorization.
   * The official WhatsApp or WhatsApp Business app must be installed on your phone. 
   * Use the "Link device" -> "Link with phone number" option in the app, then call this method with your phone number.
   * 
   * @param params - Object containing phone number in international format
   * @returns Authorization code and status
   */
  async getAuthorizationCode(params: GetAuthorizationCodeParams): Promise<GetAuthorizationCodeResponse | ErrorResponse> {
    return this._request('POST', `${this.basePath}/getAuthorizationCode`, { body: params });
  }

  /**
   * Request registration code
   * 
   * The method is designed to receive a phone number registration code via SMS or a call.
   * 
   * @param params - Object containing phone number and method (sms or voice)
   * @returns Registration code request status and details
   */
  async requestRegistrationCode(params: { phoneNumber: number; method: 'sms' | 'voice' }): Promise<any> {
    return this._request('POST', `${this.basePath}/requestRegistrationCode`, { body: params });
  }

  /**
   * Send registration code
   * 
   * The method is intended for sending the phone number registration code received via SMS or call.
   * 
   * @param params - Object containing the registration code
   * @returns Result of sending the registration code
   */
  async sendRegistrationCode(params: { code: string }): Promise<any> {
    return this._request('POST', `${this.basePath}/sendRegistrationCode`, { body: params });
  }

  // --- Sending methods ---

  /**
   * Send message
   * 
   * The method is used to send a text message to either a personal or group chat.
   * Messages are placed in a sending queue and do not require a linked device at the time of sending.
   * Queued messages will be stored for up to 24 hours until the account is authorized.
   * 
   * @param params - Message parameters including chatId, message text, and optional settings
   * @returns Sent message ID
   */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    return this._request('POST', `${this.basePath}/sendMessage`, { body: params });
  }

  /**
   * Send contact
   * 
   * This method allows you to send a contact card message to a chat. The contact message is placed 
   * in the sending queue and does not require a linked device at the time of sending.
   * Messages will remain in the queue for up to 24 hours until the account is authorized.
   * 
   * @param params - Contact parameters including chatId and contact information
   * @returns Outgoing message ID
   */
  async sendContact(params: SendContactParams): Promise<SendContactResponse> {
    return this._request('POST', `${this.basePath}/sendContact`, { body: params });
  }

  /**
   * Send file by upload
   * 
   * This method allows you to send a file by uploading it using form-data. The file message is placed 
   * in the sending queue, and the sending rate is controlled by the Message sending delay parameter.
   * Video, audio, and image files are sent in a way that allows them to be viewed or played natively in WhatsApp.
   * The maximum allowed file size is 100 MB.
   * 
   * @param params - File upload parameters including chatId, file, fileName, and optional caption
   * @returns Sent message ID
   */
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

  /**
   * Send file by URL
   * 
   * This method allows you to send a file by providing its URL. The file message is added to the sending queue
   * and will be sent as soon as the account is authorized. Messages remain in the queue for up to 24 hours.
   * Video, audio, and image files are delivered in a format that enables native viewing or playback in WhatsApp.
   * The maximum file size for outgoing files is 100 MB.
   * 
   * @param params - File URL parameters including chatId, urlFile, fileName, and optional caption
   * @returns Outgoing message ID
   */
  async sendFileByUrl(params: SendFileByUrlParams): Promise<SendFileByUrlResponse> {
    return this._request('POST', `${this.basePath}/sendFileByUrl`, { body: params });
  }

  /**
   * Send location
   * 
   * This method allows you to send a location message to a chat. The message is placed in the sending queue
   * and does not require a linked device at the time of sending. Messages remain in the queue for up to 24 hours
   * until the account is authorized.
   * 
   * @param params - Location parameters including chatId, coordinates, and optional name/address
   * @returns Outgoing message ID
   */
  async sendLocation(params: SendLocationParams): Promise<SendLocationResponse> {
    return this._request('POST', `${this.basePath}/sendLocation`, { body: params });
  }

  /**
   * Upload file
   * 
   * This method uploads a file to storage for later sending to a recipient. Use this method if you cannot 
   * send a file directly with SendFileByUrl. The response returns a link to the uploaded file, which can be 
   * reused with the SendFileByUrl method. Uploaded file links are valid for 14 days.
   * 
   * @param file - File to upload (Buffer, Blob, or File)
   * @returns Link to the uploaded file
   */
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

  /**
   * Get chat history
   * 
   * This method returns the message history for a specified chat. The response includes both sent and received 
   * messages, sorted by timestamp in descending order.
   * 
   * @param params - Chat history parameters including chatId and optional count
   * @returns List of chat messages including both incoming and outgoing messages
   */
  async getChatHistory(params: GetChatHistoryParams): Promise<GetChatHistoryResponse> {
    return this._request('POST', `${this.basePath}/getChatHistory`, { body: params });
  }

  // --- Receiving methods ---

  /**
   * Receive notification
   * 
   * This method retrieves a single incoming notification from the notifications queue. The method waits up to 
   * 5 seconds for a notification to arrive. If no notification is received within this period, an empty response 
   * is returned. After processing a notification, you must remove it from the queue using the DeleteNotification method.
   * 
   * @returns Next incoming notification or empty if none available
   */
  async receiveNotification(): Promise<any> {
    return this._request('GET', `${this.basePath}/receiveNotification`);
  }

  /**
   * Delete notification
   * 
   * This method deletes an incoming notification from the notification queue using the specified receiptId. 
   * After you receive and process a notification, call this method to permanently remove it from the queue. 
   * Once deleted, the notification is considered processed.
   * 
   * @param receiptId - Receipt ID for deleting an incoming notification
   * @returns Result of deleting the incoming notification
   */
  async deleteNotification(receiptId: number): Promise<{ result: boolean }> {
    return this._request('DELETE', `${this.basePath}/deleteNotification/${receiptId}`);
  }

  // --- Chat/Contact methods ---

  /**
   * Get contacts
   * 
   * This method retrieves a list of contacts for the current account, including both users and group chats.
   * 
   * @returns Array of contacts for the current account
   */
  async getContacts(): Promise<any[]> {
    return this._request('GET', `${this.basePath}/getContacts`);
  }

  /**
   * Get chats
   * 
   * This method retrieves a list of all chats for the current account, including both user and group chats.
   * 
   * @returns Array of chats for the current account
   */
  async getChats(): Promise<any[]> {
    return this._request('GET', `${this.basePath}/getChats`);
  }

  /**
   * Get contact information
   * 
   * This method retrieves detailed information about a contact, including name, avatar, email, 
   * business details, and product cards.
   * 
   * @param chatId - Correspondent ID
   * @returns Contact information including business and product details
   */
  async getContactInfo(chatId: string): Promise<any> {
    return this._request('GET', `${this.basePath}/getContactInfo`, {
      body: { chatId }
    });
  }

  /**
   * Set profile picture
   * 
   * This method sets a new profile picture for the account by uploading a JPEG image file.
   * 
   * @param file - JPEG image file to set as the profile picture
   * @returns Result flag, avatar URL, and reason if unsuccessful
   */
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

  /**
   * Set profile name
   * 
   * This method sets a new profile name for the account.
   * 
   * @param name - New profile name
   * @returns Empty response body on success
   */
  async setProfileName(name: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/setProfileName`, { body: { name } });
  }

  /**
   * Set profile status
   * 
   * This method sets a new status message for the account.
   * 
   * @param status - New profile status
   * @returns Empty response body on success
   */
  async setProfileStatus(status: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/setProfileStatus`, { body: { status } });
  }

  /**
   * Get avatar
   * 
   * This method returns the avatar URL for a user or group chat. If the avatar is not set or the user 
   * does not have a WhatsApp account, the URL will be empty.
   * 
   * @param chatId - User or group chat ID
   * @returns Avatar information including existence flag and URL
   */
  async getAvatar(chatId: string): Promise<any> {
    return this._request('POST', `${this.basePath}/getAvatar`, { body: { chatId } });
  }

  /**
   * Check WhatsApp account availability
   * 
   * This method checks if a WhatsApp account exists for the specified phone number.
   * 
   * @param phoneNumber - Recipient's phone number in international format
   * @returns Flag indicating WhatsApp availability for the phone number
   */
  async checkWhatsapp(phoneNumber: number): Promise<{ existsWhatsapp: boolean }> {
    return this._request('POST', `${this.basePath}/checkWhatsapp`, { body: { phoneNumber } });
  }

  // --- Group methods ---

  /**
   * Update group name
   * 
   * This method changes the name of a group chat for the specified instance.
   * 
   * @param groupId - Group chat ID
   * @param groupName - New group chat name
   * @returns Flag indicating whether the group name was successfully changed
   */
  async updateGroupName(groupId: string, groupName: string): Promise<{ updateGroupName: boolean }> {
    return this._request('POST', `${this.basePath}/updateGroupName`, { body: { groupId, groupName } });
  }

  /**
   * Get group chat data
   * 
   * This method retrieves information about a group chat, including its name, owner, creation time, 
   * participants, and invitation link.
   * 
   * @param groupId - Group chat ID
   * @returns Group chat data including participants and group details
   */
  async getGroupData(groupId: string): Promise<any> {
    return this._request('POST', `${this.basePath}/getGroupData`, { body: { groupId } });
  }

  /**
   * Leave group chat
   * 
   * This method allows the current account user to leave a specified group chat.
   * 
   * @param groupId - Group chat ID to leave
   * @returns Flag indicating whether the user has successfully left the group
   */
  async leaveGroup(groupId: string): Promise<{ leaveGroup: boolean }> {
    return this._request('POST', `${this.basePath}/leaveGroup`, { body: { groupId } });
  }

  /**
   * Set group participant as administrator
   * 
   * This method assigns administrator rights to a specified participant in a group chat.
   * 
   * @param groupId - Group chat ID
   * @param participantChatId - ID of the group participant to be set as administrator
   * @returns Flag indicating if the participant was set as administrator
   */
  async setGroupAdmin(groupId: string, participantChatId: string): Promise<{ setGroupAdmin: boolean }> {
    return this._request('POST', `${this.basePath}/setGroupAdmin`, { body: { groupId, participantChatId } });
  }

  /**
   * Remove group participant
   * 
   * This method removes a specified participant from a group chat.
   * 
   * @param groupId - Group chat ID
   * @param participantChatId - ID of the participant to be removed from the group
   * @returns Flag indicating whether the participant was successfully removed
   */
  async removeGroupParticipant(groupId: string, participantChatId: string): Promise<{ removeParticipant: boolean }> {
    return this._request('POST', `${this.basePath}/removeGroupParticipant`, { body: { groupId, participantChatId } });
  }

  /**
   * Remove group admin rights
   * 
   * This method revokes administrator rights from a specified participant in a group chat.
   * 
   * @param groupId - Group chat ID
   * @param participantChatId - ID of the group participant whose admin rights will be removed
   * @returns Flag indicating if admin rights were removed
   */
  async removeAdmin(groupId: string, participantChatId: string): Promise<{ removeAdmin: boolean }> {
    return this._request('POST', `${this.basePath}/removeAdmin`, { body: { groupId, participantChatId } });
  }

  /**
   * Create group chat
   * 
   * This method creates a new group chat with the specified name and participants.
   * 
   * @param groupName - Name for the new group chat
   * @param chatIds - List of participant IDs to add to the group
   * @returns Group creation flag, chat ID, and invitation link
   */
  async createGroup(groupName: string, chatIds: string[]): Promise<{ created: boolean; chatId: string; groupInviteLink: string }> {
    return this._request('POST', `${this.basePath}/createGroup`, { body: { groupName, chatIds } });
  }

  /**
   * Add participant to group chat
   * 
   * This method adds a specified participant to a group chat.
   * 
   * @param groupId - Group chat ID
   * @param participantChatId - ID of the participant to add to the group chat
   * @returns Flag indicating if the participant was added to the group chat
   */
  async addGroupParticipant(groupId: string, participantChatId: string): Promise<{ addParticipant: boolean }> {
    return this._request('POST', `${this.basePath}/addGroupParticipant`, { body: { groupId, participantChatId } });
  }

  /**
   * Set group picture
   * 
   * This method sets a new picture for a group chat by uploading a JPEG image file.
   * 
   * @param groupId - Group chat ID
   * @param file - JPEG image file to set as the group picture
   * @returns Result flag, avatar URL, and reason if unsuccessful
   */
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

  /**
   * Mark chat messages as read
   * 
   * This method marks messages in a chat as read. You can mark either all messages or a specific message 
   * in the chat as read.
   * 
   * @param params - Object containing chatId and optional idMessage
   * @returns Flag indicating whether messages were successfully marked as read
   */
  async readChat(params: { chatId: string; idMessage?: string }): Promise<{ setRead: boolean }> {
    return this._request('POST', `${this.basePath}/readChat`, { body: params });
  }

  // --- Archive/Unarchive ---

  /**
   * Archive chat
   * 
   * This method archives a chat. Only chats with at least one incoming message can be archived.
   * 
   * @param chatId - User or group chat ID to archive
   * @returns Empty response body on success
   */
  async archiveChat(chatId: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/archiveChat`, { body: { chatId } });
  }

  /**
   * Unarchive chat
   * 
   * This method unarchives a chat for the specified user or group chat ID.
   * 
   * @param chatId - User or group chat ID to unarchive
   * @returns Empty response body on success
   */
  async unarchiveChat(chatId: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/unarchiveChat`, { body: { chatId } });
  }

  // --- Message deletion ---

  /**
   * Delete message
   * 
   * This method deletes a message from a chat using the specified chat and message IDs.
   * 
   * @param chatId - User or group chat ID
   * @param idMessage - ID of the message to delete
   * @returns Empty response body on success
   */
  async deleteMessage(chatId: string, idMessage: string): Promise<{}> {
    return this._request('POST', `${this.basePath}/deleteMessage`, { body: { chatId, idMessage } });
  }

  // --- Queue ---

  /**
   * Clear messages queue
   * 
   * This method clears all pending messages from the sending queue for the specified instance.
   * 
   * @returns Flag indicating if the messages queue was cleared
   */
  async clearMessagesQueue(): Promise<{ isCleared: boolean }> {
    return this._request('GET', `${this.basePath}/clearMessagesQueue`);
  }

  /**
   * Show messages queue
   * 
   * This method retrieves a list of messages currently in the sending queue for the specified instance. 
   * The rate at which messages are sent from the queue is controlled by the Messages sending delay parameter.
   * 
   * @returns Array of messages currently in the sending queue
   */
  async showMessagesQueue(): Promise<any[]> {
    return this._request('GET', `${this.basePath}/showMessagesQueue`);
  }

  // --- Instance Management (user-level) ---

  /**
   * Get user account instances
   * 
   * This method retrieves all account instances created by the user.
   * Requires userId and userToken to be provided in the constructor.
   * 
   * @returns List of all account instances created by the user
   */
  async getInstances(): Promise<any> {
    if (!this.userId || !this.userToken) {
      throw new Error('userId and userToken are required for getInstances. Please provide them in the constructor.');
    }
    const url = `${this.apiHost}/api/v1/instance/user/instances/list`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': this.userId,
        'x-user-token': this.userToken,
        'Content-Type': 'application/json'
      }
    });
    return res.json();
  }

  /**
   * Create new user instance
   * 
   * This method creates a new user instance with the specified tariff and period.
   * Requires userId and userToken to be provided in the constructor.
   * 
   * @param tariff - Instance rate
   * @param period - Instance rate period (e.g., 'infinitely', 'month1', 'month3', 'month6', 'month12', 'day1')
   * @param paymentType - Optional payment system type (e.g., 'PAYPAL')
   * @returns Instance creation result with instance and order details
   */
  async createInstance(tariff: string, period: string, paymentType?: string): Promise<any> {
    if (!this.userId || !this.userToken) {
      throw new Error('userId and userToken are required for createInstance. Please provide them in the constructor.');
    }
    const url = `${this.apiHost}/api/v1/instance/user/instance/createByOrder`;
    const body: any = { tariff, period };
    if (paymentType) body.paymentType = paymentType;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': this.userId,
        'x-user-token': this.userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  /**
   * Extend paid user instance
   * 
   * This method renews a paid user instance for the specified period and tariff.
   * Requires userId and userToken to be provided in the constructor.
   * 
   * @param idInstance - Account instance ID
   * @param tariff - Instance rate
   * @param period - Instance rate period
   * @param paymentType - Optional payment system type
   * @returns Instance renewal result with renewal and order details
   */
  async extendInstance(idInstance: number, tariff: string, period: string, paymentType?: string): Promise<any> {
    if (!this.userId || !this.userToken) {
      throw new Error('userId and userToken are required for extendInstance. Please provide them in the constructor.');
    }
    const url = `${this.apiHost}/api/v1/instance/user/instance/extendByOrder`;
    const body: any = { idInstance, tariff, period };
    if (paymentType) body.paymentType = paymentType;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': this.userId,
        'x-user-token': this.userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  /**
   * Delete user instance
   * 
   * This method deletes a user instance by its ID.
   * Requires userId and userToken to be provided in the constructor.
   * 
   * @param idInstance - Account instance ID
   * @returns Instance deletion result
   */
  async deleteInstance(idInstance: number): Promise<any> {
    if (!this.userId || !this.userToken) {
      throw new Error('userId and userToken are required for deleteInstance. Please provide them in the constructor.');
    }
    const url = `${this.apiHost}/api/v1/instance/user/instance/delete`;
    const body = { idInstance };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': this.userId,
        'x-user-token': this.userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }

  /**
   * Restore user instance
   * 
   * This method restores a user instance by its ID.
   * Requires userId and userToken to be provided in the constructor.
   * 
   * @param idInstance - Account instance ID
   * @returns Instance restoration result
   */
  async restoreInstance(idInstance: number): Promise<any> {
    if (!this.userId || !this.userToken) {
      throw new Error('userId and userToken are required for restoreInstance. Please provide them in the constructor.');
    }
    const url = `${this.apiHost}/api/v1/instance/user/instance/restore`;
    const body = { idInstance };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-user-id': this.userId,
        'x-user-token': this.userToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return res.json();
  }
}

export default SDKWA;