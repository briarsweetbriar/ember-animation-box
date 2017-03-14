/* jshint ignore:start */
import Ember from 'ember';
import anime from 'ember-animejs';

const {
  assign,
  computed,
  get,
  isPresent,
  set,
  typeOf
} = Ember;

const { RSVP: { Promise, resolve } } = Ember;

export default Ember.Object.extend({
  easingIn: 'easeInOut',
  easingOut: 'easeInOut',

  transformMapping: computed(() => new Map()),

  animate(element, effect, options) {
    if (get(options, 'clear')) {
      set(this, 'transformMapping', new Map());
    } else {
      const transformMapping = get(this, 'transformMapping');
      let elementMap = transformMapping.get(element);
      if (!elementMap) { elementMap = {}; transformMapping.set(element, elementMap); }

      Object.keys(elementMap).forEach((key) => {
        const current = typeOf(elementMap[key]) === 'array' ? elementMap[key][1] : elementMap[key];
        const next = isPresent(effect[key]) ? effect[key] : current;

        effect[key] = [current, next];
      });

      assign(elementMap, effect);
    }

    if (!options.easing) { options.easing = 'easeInOutSine'; }
    if (options.duration === 0) { options.duration = 1; }

    return new Promise((resolve) => {
      anime({
        targets: element,
        complete: resolve,
        ...options,
        ...effect
      });
    });
  }
});
