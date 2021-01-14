import electron, { IpcMain, IpcRenderer, WebContents } from 'electron'

type IPC = IpcMain | IpcRenderer

/**
 * default channel name for messaging between main & render
 */
export const DEFAULT_CHANNEL_NAME = '__wonderful_xiu__'

type ErrorHandler = (e: Error) => any

export type IHandlerMap = Record<string, Function>
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
    // the second is the options, and should has onprogress callback if it need progress info
    const options = args[0]
    // get the onprogress callback
    const onprogress =
      options &&
      typeof options.onprogress === 'function' &&
      options.onprogress

    // assemble the request structure
    const reqData = {
      // message id, false for one way message(no need response)
      id: ++this.msgID,
      args,
      progress: !!onprogress
    }

    ipc.send(channel, reqData)

    // response message id
    const msgID = `${channel}-${reqData.id}`
    // progress message id
    const msgProgressID = `${msgID}-progress`
    if (onprogress) {
      this.ipc.on(msgProgressID, (evt, resp) => {
        onprogress(resp)
      })
    }

    // return a promise to get the response
    return new Promise((resolve, reject) => {
      // listen to the response
      this.ipc.once(msgID, (event, resp) => {
        // remove listener for the progress message
        this.ipc.removeAllListeners(msgProgressID)
        resp.isSuccess ? resolve(resp.data) : reject(resp.data)
      })
    })
  }

  /**
   * pack the common message callback to handle the message from the other side
   * @param channel channel name
   * @param cb message callback
   */
  private _listenTo (channel: string, handlerMap: IHandlerMap) {
    const realListener = async (evt: electron.IpcRendererEvent | electron.IpcMainEvent, { id, args, progress }: { id: string, args: any[], progress: boolean }) => {
      let resp: any
      const [methodName, ...restArgs] = args
      if (id && progress && restArgs[0]) {
        // reassign the onprogress
        restArgs[0].onprogress = function (data) {
          evt.sender.send(`${channel}-${id}-progress`, data)
        }
      }
      // append raw event as the last argument
      restArgs.push(evt)
      let isSuccess = true
      // catch the callback error
      try {
        const cb = handlerMap[methodName]
        // @ts-nocheck
        if (typeof cb !== 'function') throw new Error(`[IPC-RPC] method ${methodName} not a function in channel ${channel}`)
        resp = await cb.apply(null, restArgs)
      } catch (e) {
        // hander the error by errorHandler or just return the error
        resp = this.errorHandler ? this.errorHandler(e) : e
        isSuccess = false
      }
      id && evt.sender.send(`${channel}-${id}`, { data: resp, isSuccess })
    }
    // save the real message callback  for `off` using
    return realListener
  }

  /**
   * listen default message channel
   * @param handlerMap 
   */
  onMsg(handlerMap: IHandlerMap) {
    this.on(DEFAULT_CHANNEL_NAME, handlerMap)
  }
  /** 
   * listen to a message
   * @param channel channel name
   * @param handlerMap handler map
   */
  on (channel: string, handlerMap: IHandlerMap) {
    this.ipc.on(channel, this._listenTo(channel, handlerMap))
  }
  /**
   * remove channel's callback
   * @param channel channel name
   * @param cb message callback, leave empty to remove all channel callback
   */
  off (channel: string) {
    this.ipc.removeAllListeners(channel)
  }
}
