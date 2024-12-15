const subscribers = {};

export function subscribe(event, callback) {
  if (!subscribers[event]) subscribers[event] = [];
  subscribers[event].push(callback);
}

export function publish(event, ...args) {
  if (subscribers[event]) {
    subscribers[event].forEach((callback) => {
      Promise.resolve().then(() => callback(...args));
    });
  }
}
