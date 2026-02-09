/**
 * PictureEditWebSocket 类用于管理图片编辑的 WebSocket 连接
 * 包括连接建立、消息发送与接收、事件处理等功能
 */
export default class PictureEditWebSocket {
  private pictureId: number
  private socket: WebSocket | null
  private eventHandlers: any

  private reconnectTimer: number | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 10
  private readonly baseDelayMs = 1000
  private readonly maxDelayMs = 30000
  private isManuallyClosed = false

  constructor(pictureId: number) {
    this.pictureId = pictureId // 当前编辑的图片 ID
    this.socket = null // WebSocket 实例
    this.eventHandlers = {} // 自定义事件处理器
  }

  /**
   * 初始化 WebSocket 连接
   */
  connect() {
    this.isManuallyClosed = false
    const url = `ws://localhost:8123/api/ws/picture/edit?pictureId=${this.pictureId}`
    this.socket = new WebSocket(url)

    // 设置携带 cookie
    this.socket.binaryType = 'blob'

    // 监听连接成功事件
    this.socket.onopen = () => {
      console.log('WebSocket 连接已建立')
      this.reconnectAttempts = 0
      this.clearReconnectTimer()
      this.triggerEvent('open')
    }

    // 监听消息事件
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('收到消息:', message)

      // 根据消息类型触发对应事件
      const type = message.type
      this.triggerEvent(type, message)
    }

    // 监听连接关闭事件
    this.socket.onclose = (event) => {
      console.log('WebSocket 连接已关闭:', event)
      this.triggerEvent('close', event)
      if (!this.isManuallyClosed) this.scheduleReconnect()
    }

    // 监听错误事件
    this.socket.onerror = (error) => {
      console.error('WebSocket 发生错误:', error)
      this.triggerEvent('error', error)
      if (!this.isManuallyClosed) this.scheduleReconnect()
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  disconnect() {
    if (this.socket) {
      this.isManuallyClosed = true
      this.clearReconnectTimer()
      this.socket?.close()
      this.socket = null
      console.log('WebSocket 连接已手动关闭')
    }
  }

  /**
   * 发送消息到后端
   * @param {Object} message 消息对象
   */
  sendMessage(message: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
      console.log('消息已发送:', message)
    } else {
      console.error('WebSocket 未连接，无法发送消息:', message)
    }
  }

  /**
   * 添加自定义事件监听
   * @param {string} type 消息类型
   * @param {Function} handler 消息处理函数
   */
  on(type: string, handler: (data?: any) => void) {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = []
    }
    this.eventHandlers[type].push(handler)
  }

  /**
   * 触发事件
   * @param {string} type 消息类型
   * @param {Object} data 消息数据
   */
  triggerEvent(type: string, data?: any) {
    const handlers = this.eventHandlers[type]
    if (handlers) {
      handlers.forEach((handler: any) => handler(data))
    }
  }

  /**
   * 指数退避重连：1s, 2s, 4s ... 上限 30s，最多 10 次
   */
  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return

    const delay = Math.min(this.baseDelayMs * 2 ** this.reconnectAttempts, this.maxDelayMs)
    this.reconnectAttempts += 1

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}
