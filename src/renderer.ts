import { IpcRenderer } from 'electron'
import Base from './base'
class Message extends Base {
  /**
   * a general method to send message to the main process
   * @param channel channel name
   * @param args
   */
  send (channel, ...args) {
    return this._send(this.ipc as IpcRenderer, channel, ...args)
  }

  /**
   * default message method to send message to main process, no need to set the channel name
   * @param methodName method name to call
   * @param args arguments for the method
   */
  sendMsg (methodName: string, ...args: any[]) {
    return this._send(this.ipc as IpcRenderer, Base.DEFAULT_CHANNEL_NAME, methodName, ...args)
  }
}

export default new Message()
