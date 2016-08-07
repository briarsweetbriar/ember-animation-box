import Ember from 'ember';

export default Ember.Object.extend({
  animate(element, effect, options) {
    return Ember.$.Velocity.animate(element, effect, options);
  }
});
