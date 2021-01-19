import { WebContents, BrowserWindow } from 'electron'
import Base from './base'

type getWindowWebContents = (winName: string) => WebContents

class Message extends Base {
  private getWindowWebContents?: getWindowWebContents
  constructor (getWebContents?: getWindowWebContents) {
    super(true)
    this.getWindowWebContents = getWebContents
  }

  /**
   * set a function to get the renderer window's webContents by a string
   * @param fn
   */
  setGetWinWebContents (fn: getWindowWebContents) {
    this.getWindowWebContents = fn
  }

  private getWinContents (winName: string | WebContents | BrowserWindow): WebContents {
    if (winName instanceof BrowserWindow) return winName.webContents
    if (typeof winName === 'string' && this.getWindowWebContents) {
      return this.getWindowWebContents(winName)
    }
    // WebContents not exported from electron lib(but in type definitions), so `winName instanceof WebContents` not working
    //    workaround by checking its properties
    // @ts-ignore
    if (winName && winName.browserWindowOptions && winName.webContents) return winName
    throw new Error('[IPC-RPC]cannot find window ' + winName)
  }
  /**
   *
   * @param winName window name or a webContents object
   * @param channel channel name
   * @param args
   */
  send (winName: string | WebContents | BrowserWindow, channel: string, ...args: any[]) {
    const win = this.getWinContents(winName)
    if (!win) return console.warn(`window ${winName} not exists`)
    return this._send(win, channel, ...args)
  }

  sendMsg (winName: string | WebContents | BrowserWindow, ...args: any[]) {
    return this.send(winName, Base.DEFAULT_CHANNEL_NAME, ...args)
  }
}

export default new Message()
