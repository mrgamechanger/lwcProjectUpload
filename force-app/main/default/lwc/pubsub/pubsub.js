let callbacks = {};

/**
 * Registers a callback for a given event
 */
const register = (eventName, callback) => {
  if (!callbacks[eventName]) {
    callbacks[eventName] = new Set();
  }
  callbacks[eventName].add(callback);
};

/**
 * Unregisters a specific callback for a given event
 */
const unregister = (eventName, callback) => {
  if (callbacks[eventName]) {
    callbacks[eventName].delete(callback);
    if (callbacks[eventName].size === 0) {
      delete callbacks[eventName];
    }
  }
};

/**
 * Unregisters all callbacks for all events
 */
const unregisterAll = () => {
  callbacks = {};
};

/**
 * Fires an event, calling all registered callbacks with the given payload
 */
const fire = (eventName, payload) => {
  if (callbacks[eventName]) {
    callbacks[eventName].forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error in callback for event "${eventName}":`, error);
      }
    });
  }
};

export default { register, unregister, unregisterAll, fire };