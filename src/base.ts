import electron, { IpcMain, IpcRenderer, WebContents } from 'electron'

type IPC = IpcMain | IpcRenderer

/**
 * default channel name for messaging between main & render
 */
export const CHANNEL_HUB_NAME = 'messagehub'

type ErrorHandler = (e: Error) => any

export default class MessageHub {
  private isMainProcess: boolean
  private msgID: number
  protected ipc: IPC
  private errorHandler?: ErrorHandler
  constructor () {
    // detect whether in main process
    this.isMainProcess = process.type === 'browser'
    // save IPC object
    this.ipc = this.isMainProcess ? electron.ipcMain : electron.ipcRenderer
    // msg number
    this.msgID = 0
  }

  setErrorHandler (handler: ErrorHandler) {
    this.errorHandler = handler
  }
  /**
   * inner send method
   * @param ipc object to send message
   * @param channel channel name
   * @param args rest argruments, we assume args[0] is function name be called in the other side
   */
  protected _send (
    ipc: IpcRenderer | WebContents,
    channel: string,
    ...args: any[]
  ) {
    // last arguments means whether this request need response, true by default
    const needRes: boolean =
      typeof args[args.length - 1] === 'boolean' ? args.pop() : true
    // the first argument means method
    // const method = args[0]

    // the second is the options, and should has onprogress callback if it need progress info
    const options = args[1]
    // get the onprogress callback
    const onprogress =
      needRes &&
      options &&
      typeof options.onprogress === 'function' &&
      options.onprogress

    // assemble the request structure
    const reqData = {
      // message id, false for one way message(no need response)
      id: needRes ? ++this.msgID : false,
      args,
      progress: !!onprogress
    }

    ipc.send(channel, reqData)
    // return if no need reponse
    if (!needRes) return

    // response message id
    const msgid = `${channel}-${reqData.id}`
    // progress message id
    const msgprgid = `${msgid}-progress`
    if (onprogress) {
      // @ts-ignore
      this.ipc.on(msgprgid, (evt, resp) => {
        // call progress callback if progress message received
        onprogress(resp)
      })
    }

    // return a promsise to get the response
    return new Promise(resolve => {
      // listen to the response
      // @ts-ignore
      this.ipc.once(msgid, (event, resp) => {
        // remove listener for the progress message
        // @ts-ignore
        this.ipc.removeAllListeners(msgprgid)
        resolve(resp)
      })
    })
  }

  /**
   * pack the common message callback to handle the message from the other side
   * @param channel channel name
   * @param cb message callback
   */
  private _listenTo (channel: string, cb: Function) {
    const realListener = async (evt, { id, args, progress }) => {
      let resp: any
      if (id && progress && args[1]) {
        // reassign the onprogress
        args[1].onprogress = function (data) {
          evt.sender.send(`${channel}-${id}-progress`, data)
        }
      }
      // catch the callback error
      try {
        resp = await cb.apply(null, args)
      } catch (e) {
        // hander the error by errorHandler or just return the error
        resp = this.errorHandler ? this.errorHandler(e) : e
      }
      id && evt.sender.send(`${channel}-${id}`, resp)
    }
    // save the real message callback  for `off` using
    // @ts-ignore
    cb._realListener = realListener
    return realListener
  }
  /**
   * listener to a message
   * @param channel channel name
   * @param cb message callback
   */
  on (channel: string, cb: Function) {
    // @ts-ignore
    this.ipc.on(channel, this._listenTo(channel, cb))
  }
  /**
   * remove channel's callback
   * @param channel channel name
   * @param cb message callback, leave empty to remove all channel callback
   */
  off (channel: string, cb?: Function) {
    if (cb) {
      // @ts-ignore
      cb._realListener && this.ipc.removeListener(channel, cb._realListener)
      return
    }
    // @ts-ignore
    this.ipc.removeAllListeners(channel)
  }
}
