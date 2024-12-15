const subscribers = {};

/**
 * Subscribes a callback to a specific event.
 * @param {string} event - The name of the event to subscribe to.
 * @param {function} callback - The function to execute when the event is published.
 */
export function subscribe(event, callback) {
  if (!subscribers[event]) {
    subscribers[event] = [];
  }
  subscribers[event].push(callback);
}

/**
 * Publishes an event and triggers all its subscribed callbacks.
 * @param {string} event - The name of the event to publish.
 * @param {*} data - Optional data to pass to the subscribed callbacks.
 */
export function publish(event, data) {
  if (subscribers[event]) {
    subscribers[event].forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in callback for event "${event}":`, err);
      }
    });
  }
}

/**
 * Unsubscribes a specific callback from an event.
 * @param {string} event - The name of the event.
 * @param {function} callback - The callback function to remove.
 */
export function unsubscribe(event, callback) {
  if (subscribers[event]) {
    subscribers[event] = subscribers[event].filter((cb) => cb !== callback);
  }
}

/**
 * Clears all subscribers for a specific event or all events.
 * @param {string} [event] - Optional. The name of the event to clear. If not provided, clears all events.
 */
export function clear(event) {
  if (event) {
    delete subscribers[event];
  } else {
    Object.keys(subscribers).forEach((eventName) => {
      delete subscribers[eventName];
    });
  }
}
