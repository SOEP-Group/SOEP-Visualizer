// But any global state that you want in here only

import { publish } from "./eventBuss.js";

export class State {
  constructor(eventName, initialState) {
    if (!eventName) {
      console.error("No eventName provided when create a state");
    }
    this.eventName = eventName;
    this.state = { ...initialState };
  }

  deepCopy(obj) {
    // Avoid JSON stringify issues by checking if obj is serializable
    return obj !== undefined && obj !== null
      ? JSON.parse(JSON.stringify(obj))
      : obj;
  }

  deepEqual(value1, value2) {
    // Handle `undefined` or `null` directly
    if (value1 === value2) return true;
    if (value1 == null || value2 == null) return value1 === value2;
    return JSON.stringify(value1) === JSON.stringify(value2);
  }

  get(key) {
    if (key in this.state) {
      return this.deepCopy(this.state[key]);
    }
    console.warn(`Key "${key}" does not exist in the state`);
    return null;
  }

  set(updates) {
    let dirtyFlags = {};
    Object.keys(this.state).forEach((key) => {
      dirtyFlags[key] = false;
    });
    let hasChanges = false;
    Object.keys(updates).forEach((key) => {
      if (
        !(key in this.state) ||
        !this.deepEqual(this.state[key], updates[key])
      ) {
        this.state[key] = this.deepCopy(updates[key]);
        dirtyFlags[key] = true;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      publish(this.eventName, dirtyFlags);
    }
  }
}

export let globalState = new State("onGlobalStateChanged", {});
