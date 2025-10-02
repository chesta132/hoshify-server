/**
 * Only pick some fields in object, other properties will deleted.
 *
 * @param data - Object to initiate.
 * @param picks - Keys of data to pick.
 * @returns The object with only picked properties.
 */
export const pick = <T extends Record<string, any>, Z extends (keyof T)[] = []>(data: T, picks?: Z): Pick<T, Z[number]> => {
  const pickedData = { ...data };
  if (picks)
    for (const pick of Object.keys(pickedData)) {
      if (!picks.includes(pick as keyof object)) {
        delete pickedData[pick as keyof object];
      }
    }
  return pickedData;
};

/**
 * Only omit some fields in object, other properties will remain.
 *
 * @param data - Object to initiate.
 * @param omits - Keys of data to omit.
 * @returns The object with omitted properties.
 */
export const omit = <T extends Record<string, any>, Z extends (keyof T)[] = []>(data?: T, omits?: Z): Omit<T, Z[number]> => {
  if (!data) return data as any;
  const omittedData = { ...data };
  if (omits)
    for (const omit of omits) {
      delete omittedData[omit];
    }
  return omittedData;
};

/**
 * Creates a new object with the same keys as the given object,
 * but all values replaced with a fixed type/value.
 *
 * @param data - Original object to get the keys from
 * @param recordType - The value or type to assign to each key
 * @returns A new object where each key of `data` has the same value `recordType`
 *
 * @example
 * ```ts
 * const obj = { foo: 1, bar: "yo" };
 * const rec = record(obj, false);
 * // rec: { foo: boolean; bar: boolean } = { foo: false, bar: false }
 * ```
 */
export const record = <T extends Record<string, any>, Z>(data: T, recordType: Z) => {
  const buildedData = { ...data } as Record<keyof T, Z>;
  Object.keys(buildedData).forEach((key: keyof T) => {
    buildedData[key] = recordType;
  });
  return buildedData;
};

/**
 * Wraps an object in a Proxy that automatically binds all methods to a specified target object.
 * This allows methods to be called with a different `this` context than the original object.
 *
 * @param target - The object to wrap with the Proxy
 * @param bindTarget - The object to bind all methods to (the `this` context)
 * @returns A proxied version where all methods are bound to `bindTarget`
 *
 * @example
 * ```ts
 * class ClassA extends ClassB {
 *   constructor() {
 *     super();
 *     return proxy(this, new ClassC()); // Auto-bind all methods in ClassC
 *   }
 * }
 * ```
 */
export const proxy = <T extends object, Z extends object>(target: T, plugin: Z) => {
  return new Proxy(target, {
    get(obj, key, receiver) {
      if (key in plugin) {
        const pluginProp = Reflect.get(plugin, key, plugin);
        if (typeof pluginProp === "function") {
          return pluginProp.bind(plugin);
        }
        return pluginProp;
      }

      const targetProp = Reflect.get(obj, key, receiver);
      if (typeof targetProp === "function") {
        return targetProp.bind(obj);
      }
      return targetProp;
    },
  });
};

/**
 * Applies multiple plugin objects to a target by chaining proxies.
 * Each plugin's methods are merged into the target, enabling a composable plugin-based architecture.
 * Plugins are applied in order, so later plugins can override earlier ones if they have methods with the same name.
 *
 * @param target - The base object to extend with plugins
 * @param plugins - One or more plugin objects whose methods will be merged into the target
 * @returns A proxied version of the target with all plugin methods accessible
 *
 * @example
 * ```ts
 * class ClassA {
 *   constructor() {
 *     super();
 *     return applyPlugins(this, new PluginA(), new PluginB(), new PluginC());
 *     // Auto-bind all methods plugins
 *   }
 * }
 * ```
 */
export const applyPlugins = <T extends object>(target: T, ...plugins: object[]): T => {
  return plugins.reduce((result, plugin) => proxy(result, plugin), target) as T;
};
