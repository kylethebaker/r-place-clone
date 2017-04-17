/**
 * Listens to a socket channel and stores incoming events into a cache
 */
export default class SocketEventCache {

  /**
   * Creates a new SocketEventCache
   *
   * @param {string} eventName
   *   The socket event to cache
   * @param {object} socketClient
   *   A socket.io client instance
   */
  constructor(eventName, socketClient) {
    this.eventName = eventName;
    this.socket = socketClient;
    this.queue = [];
    this.listenFn = (data) => {
      this.queue.push(data);
    };
  }

  /**
   * Begins caching the socket events
   */
  startListening() {
    this.socket.on(this.eventName, this.listenFn);
  }

  /**
   * Stops caching the socket events
   */
  stopListening() {
    this.socket.off(this.eventName, this.listenFn);
  }

  /**
   * Returns the entire cache
   */
  getCachedBlocks() {
    return this.queue;
  }

  /**
   * Empties the cache
   */
  emptyCache() {
    this.queue = [];
  }

  /**
   * Empties and returns the cache
   */
  consumeCache() {
    const cache = this.getCachedBlocks();
    this.emptyCache();
    return cache;
  }
}
