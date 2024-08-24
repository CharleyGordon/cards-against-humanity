const inversedPool = {
  create() {
    const genericPool = new Map();
    const objectPool = new Map();

    return {
      set(key, value) {
        let temp;
        switch (typeof key) {
          case "object": {
            temp = value;
            value = key;
            key = temp;
            break;
          }
          default: {
            break;
          }
        }
        genericPool.set(key, value);
        objectPool.set(value, key);
      },
      get(targetValue) {
        let targetMap;
        switch (typeof targetValue) {
          case "object": {
            targetMap = objectPool;
            break;
          }
          default: {
            targetMap = genericPool;
            break;
          }
        }

        return targetMap.get(targetValue) ?? false;
      },
      getObjectPool() {
        return objectPool;
      },
      getGenericPool() {
        return genericPool;
      },
      delete(targetValue) {
        let targetMap, secondValue, secondMap;
        switch (typeof targetValue) {
          case "number": {
            targetMap = genericPool;
            secondMap = objectPool;
            break;
          }
          case "string": {
            targetMap = genericPool;
            secondMap = objectPool;
            break;
          }
          default: {
            targetMap = objectPool;
            secondMap = genericPool;
            break;
          }
        }
        secondValue = targetMap.get(targetValue);

        if (!secondValue && typeof secondValue !== "boolean") return false;

        targetMap.delete(targetValue);
        secondMap.delete(secondValue);

        return true;
      },
    };
  },
};

export default inversedPool;
