import Ember from 'ember';

const {
  assign,
  get
} = Ember;

export default Ember.Object.extend({
  animate(element, effect, options) {
    let finalEffect = effect;

    if (get(options, 'clear')) {
      finalEffect = assign({ translateX: 0, translateY: 0, translateZ: 0 }, effect);
      element.removeAttribute('style');
    }

    return Ember.$.Velocity.animate(element, finalEffect, options);
  }
});
