/* jshint ignore:start */
import Ember from 'ember';
import anime from 'ember-animejs';

const {
  assign,
  computed,
  get,
  set
} = Ember;

const { RSVP: { Promise, resolve } } = Ember;

export default Ember.Object.extend({
  easingIn: 'easeOutSine',
  easingOut: 'easeInExpo',

  transformMapping: computed(() => new Map()),

  animate(element, effect, options) {
    if (get(options, 'clear')) {
      set(this, 'transformMapping', new Map());
    } else {
      const transformMapping = get(this, 'transformMapping');
      let elementMap = transformMapping.get(element);
      if (!elementMap) { elementMap = {}; transformMapping.set(element, elementMap); }
      const transforms = [
        'translateX', 'translateY', 'translateZ',
        'rotateX', 'rotateY', 'rotateZ',
        'scaleX', 'scaleY', 'scaleZ',
        'skewX', 'skewY', 'skewZ'
      ].reduce((transforms, transform) => {
        if (elementMap[transform]) { transforms[transform] = elementMap[transform]; }
        if (effect[transform]) { elementMap[transform] = effect[transform]; }

        return transforms;
      }, {});

      effect = assign(transforms, effect);
    }

    if (!options.easing) { options.easing = 'easeInOutSine'; }

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
