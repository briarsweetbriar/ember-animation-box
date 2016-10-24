import Ember from 'ember';

const { get } = Ember;
const { RSVP: { resolve } } = Ember;

export default Ember.Object.extend({
  animate(element, effect, options) {
    if (get(options, 'clear')) {
      element.removeAttribute('style');
    }

    Ember.$(element).css(effect);

    return resolve();
  }
});
