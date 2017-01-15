import Ember from 'ember';

const {
  assign,
  get
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Ember.Object.extend({
  easingIn: 'easeOutSine',
  easingOut: 'easeInExpo',

  animate(element, effect, options) {
    let finalEffect = effect;

    if (get(options, 'clear')) {
      if (element.style.transform.includes('translateX')) {
        finalEffect = assign({ translateX: 0 }, finalEffect);
      }
      if (element.style.transform.includes('translateY')) {
        finalEffect = assign({ translateY: 0 }, finalEffect);
      }
      if (element.style.transform.includes('translateZ')) {
        finalEffect = assign({ translateZ: 0 }, finalEffect);
      }

      element.removeAttribute('style');
    }

    if (Object.keys(finalEffect).length === 0) { return resolve(); }

    return Ember.$.Velocity.animate(element, finalEffect, options);
  }
});
