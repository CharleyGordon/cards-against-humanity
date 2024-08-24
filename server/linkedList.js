function append({ to = false, what }) {
  const instance = to || this.tail || false;
  const elementToAppend = linkedList.createInstance(what, this);

  switch (instance) {
    case false: {
      break;
    }
    default: {
      instance.next = elementToAppend;
      elementToAppend.previous = instance;
    }
  }

  switch (this.tail) {
    case false: {
      this.tail = elementToAppend;
      break;
    }
    case instance: {
      this.tail = elementToAppend;
      break;
    }
  }

  switch (this.head) {
    case false: {
      this.head = elementToAppend;
      break;
    }
  }

  return elementToAppend;
}

function prepend({ to = false, what }) {
  const instance = to || this.head || false;
  const elementToPrepend = linkedList.createInstance(what, this);

  instance.previous = elementToPrepend;

  switch (this.head) {
    case false: {
      this.head = elementToPrepend;
      break;
    }
    default: {
      break;
    }
  }

  switch (instance) {
    case this.head: {
      this.head = elementToPrepend;
    }
  }

  switch (this.tail) {
    case false: {
      this.tail = elementToPrepend;
      break;
    }
    default: {
      break;
    }
  }

  elementToPrepend.next = instance;

  return elementToPrepend;
}

function forEach({ callback, exitValue }) {
  let node = this.head;
  let value;
  while (node) {
    value = callback(node.value);

    console.dir({ value });

    switch (value) {
      case exitValue: {
        return true;
      }
    }

    node = node.next;
  }

  return true;
}

function remove(instance) {
  if (!instance) return false;
  const previous = instance.previous ?? false;
  const next = instance.next ?? false;

  switch (previous) {
    case false: {
      break;
    }
    default: {
      previous.next = next;
      break;
    }
  }

  switch (next) {
    case false: {
      break;
    }
    default: {
      next.previous = previous;
    }
  }

  switch (instance) {
    case this.tail: {
      this.tail = previous;
      break;
    }
    case this.head: {
      this.head = next;
      break;
    }
  }

  instance.removed = true;

  return instance;
}

function appendToInstance(what) {
  return this.parent.append({ to: this, what });
}

function prependToInstance(what) {
  return this.parent.prepend({ to: this, what });
}

function removeSelf() {
  if (instance.removed) return false;
  return remove(this);
}

const linkedList = {
  create() {
    const list = {
      head: false,
      tail: false,
      append,
      prepend,
      remove,
      forEach,
    };

    return list;
  },

  createInstance(value, parent) {
    const instance = {
      value,
      parent,
      next: false,
      previous: false,
      append: appendToInstance,
      prepend: prependToInstance,
      remove: removeSelf,
    };

    return instance;
  },
};

const myList = linkedList.create();

export default linkedList;
