import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import ResizeAware from 'ember-resize-for-addons';

const {
  Mixin,
  assign,
  computed,
  get,
  getOwner,
  getProperties,
  isNone,
  isPresent,
  observer,
  on,
  set,
  typeOf
} = Ember;

const {
  RSVP: {
    Promise,
    resolve
  }
} = Ember;

export default Mixin.create(ResizeAware, {
  isInstant: false,
  transitions: computed(() => []),

  _history: computed(() => Ember.A()),
  _transitionQueue: computed(() => Ember.A()),

  didResize() {
    this._handleResize();
  },

  _handleResize() {
    const accumulator = get(this, '_history').reduce((accumulator, transition) => {
      const selector = get(transition, 'element') || '_main';
      const selectorAccumulator = get(accumulator, selector) || set(accumulator, selector, {});

      assign(selectorAccumulator, this._generateEffect(get(transition, 'effect') || {}));

      return accumulator;
    }, {});

    Object.keys(accumulator).forEach((key) => {
      const element = key === '_main' ? this.element : this.$(key).get(0);

      this._performAnimation(element, { effect: accumulator[key], duration: 0, clear: true });
    });
  },

  animatorInstance: computed('animator', {
    get() {
      const adapter = get(this, 'animator') || 'jquery';

      return getOwner(this).lookup(`eab-animation-adapter:${adapter}`);
    }
  }),

  loadAndPerformQueue: on('init', observer('transitions.[]', function() {
    this._queueTransitions();

    get(this, '_mainQueueTask').perform();
  })),

  _queueTransitions() {
    const queue = get(this, '_transitionQueue');
    const history = get(this, '_history');
    const transitions = get(this, 'transitions');

    if (transitions) {
      queue.pushObjects(transitions);
      history.pushObjects(transitions);

      transitions.length = 0;
    }
  },

  _mainQueueTask: task(function * () {
    const queue = get(this, '_transitionQueue');

    if (queue.length > 0) {
      yield get(this, '_queueTask').perform('main', queue);

      if (typeOf(this.attrs.didCompleteQueue) === 'function') {
        this.attrs.didCompleteQueue();
      }
    }
  }).keepLatest(),

  _queueTask: task(function * (queueName, queue) {
    while (queue.length > 0) {
      yield this._executeNextTransition(queueName, queue);
    }
  }),

  _executeNextTransition(parentQueueName, queue) {
    const queueName = get(queue[0], 'queue');

    if (queueName === parentQueueName || isNone(queueName)) {
      return this._transitionSwitch(queue.shift());
    } else {
      this._startParallelQueue(queueName, queue);

      return resolve();
    }
  },

  _startParallelQueue(queueName, queue) {
    const exitTransition = queue.find((transition) => get(transition, 'queue') !== queueName);
    const queueLength = isPresent(exitTransition) ? queue.indexOf(exitTransition) : queue.length;

    get(this, '_queueTask').perform(queueName, queue.splice(0, queueLength));
  },

  _transitionSwitch(transition) {
    if (isPresent(get(transition, 'crossFade'))) {
      return this._crossFade(transition);
    } else if (isPresent(get(transition, 'effect'))) {
      return this._animate(transition);
    } else if (isPresent(get(transition, 'external'))) {
      return this._resolveExternally(transition);
    } else {
      return this._delay(transition);
    }
  },

  _delay(transition) {
    return get(this, 'isInstant') ? resolve() : timeout(get(transition, 'duration'));
  },

  _resolveExternally(transition) {
    return new Promise((resolve) => {
      this.attrs.externalAction(get(transition, 'external'), resolve);
    });
  },

  _animate(transition) {
    const selector = get(transition, 'element');
    const activeInstanceClass = get(this, '_activeInstanceClass');
    const activeInstanceSelector = activeInstanceClass ? `.${activeInstanceClass}` : '';
    const element = this.$(isPresent(selector) ? `${activeInstanceSelector} ${selector}` : undefined).get(0);

    return this._performAnimation(element, transition);
  },

  _performAnimation(element, transition) {
    const effect = this._generateEffect(get(transition, 'effect') || {});
    const options = getProperties(transition, ...Object.keys(transition));

    Reflect.deleteProperty(options, 'queue');
    Reflect.deleteProperty(options, 'element');

    if (get(this, 'isInstant')) {
      set(options, 'duration', 0);
    }

    return get(this, 'animatorInstance').animate(element, effect, options);
  },

  _generateEffect(container) {
    return Object.keys(container).reduce((accumulator, key) => {
      if (key.includes('@media')) {
        if (this._mediaQueryIsValid(key)) {
          assign(accumulator, get(container, key));
        }
      } else {
        accumulator[key] = container[key];
      }

      return accumulator;
    }, {});
  },

  _mediaQueryIsValid(string) {
    return string.match(/\(([^)]+?)\)/g).every((query) => {
      const [property, value] = query.substring(1, query.length - 1).split(':');

      switch (property) {
        case 'min-height': return this._hasMinHeight(value);
        case 'max-height': return this._hasMaxHeight(value);
        case 'min-width': return this._hasMinWidth(value);
        case 'max-width': return this._hasMaxWidth(value);
        default: return false;
      }
    });
  },

  _hasMinHeight(value) {
    return this.element.clientHeight >= parseInt(value, 10);
  },

  _hasMaxHeight(value) {
    return this.element.clientHeight <= parseInt(value, 10);
  },

  _hasMinWidth(value) {
    return this.element.clientWidth >= parseInt(value, 10);
  },

  _hasMaxWidth(value) {
    return this.element.clientWidth <= parseInt(value, 10);
  }
});
