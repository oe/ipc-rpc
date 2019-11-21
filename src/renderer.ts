import { IpcRenderer } from 'electron'
import Base, { CHANNEL_HUB_NAME } from './base'

class Message extends Base {
  /**
   * a general method to send message to the main process
   * @param channel channel name
   * @param args
   */
  send (channel, ...args) {
    this._send(this.ipc as IpcRenderer, channel, ...args)
  }

  /**
   * default message method to send message to main process, no need to set the channel name
   * @param method method name to call
   * @param args arguments for the method
   */
  sendMsg (method: string, ...args: any[]) {
    this._send(this.ipc as IpcRenderer, CHANNEL_HUB_NAME, method, ...args)
  }
}

export default new Message()
