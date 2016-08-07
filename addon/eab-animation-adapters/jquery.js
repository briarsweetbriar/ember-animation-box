import Ember from 'ember';

const { RSVP: { resolve } } = Ember;

export default Ember.Object.extend({
  animate(element, effect) {
    Ember.$(element).css(effect);

    return resolve();
  }
});
