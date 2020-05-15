import { WebContents } from 'electron'
import Base from './base'
export { CHANNEL_HUB_NAME } from './base'

type getWindowWebContents = (name: string) => WebContents

class Message extends Base {
  private getWindowWebContents?: getWindowWebContents
  constructor (getWebContents?: getWindowWebContents) {
    super()
    this.getWindowWebContents = getWebContents
  }

  /**
   * set a function to get the renderer window's webContents by a string
   * @param fn
   */
  setGetWinWebContents (fn: getWindowWebContents) {
    this.getWindowWebContents = fn
  }

  private getWinContents (winName: string | WebContents): WebContents {
    if (winName instanceof WebContents) return winName
    // @ts-ignore
    if (this.getWindowWebContents) {
      return this.getWindowWebContents(winName)
    }
    throw new Error('cannot find window ' + winName)
  }
  /**
   *
   * @param winName window name or a webcontents object
   * @param channel channel name
   * @param args
   */
  send (winName: string | WebContents, channel: string, ...args: any[]) {
    const win = this.getWinContents(winName)
    if (!win) return console.warn(`window ${winName} not exists`)
    return this._send(win, channel, ...args)
  }
}

export default new Message()
