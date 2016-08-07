import Ember from 'ember';

export default Ember.Controller.extend({
  text: 'I am the original text. . . .',

  transitions: [{
    duration: 500,
    effect: {
      translateX: '100px'
    }
  }, {
    crossFade: {
      in: {
        text: 'I am new text!!!',
        duration: 1000,
        effect: {
          opacity: 1
        }
      },
      out: {
        duration: 1500,
        effect: {
          opacity: 0
        }
      }
    }
  }, {
    crossFade: {
      in: {
        text: 'I am newer text!!!',
        duration: 1000,
        effect: {
          opacity: 1
        }
      },
      out: {
        duration: 1500,
        effect: {
          opacity: 0
        }
      }
    }
  }, {
    crossFade: {
      in: {
        text: 'I am newest text!!!',
        duration: 1000,
        effect: {
          opacity: 1
        }
      },
      out: {
        duration: 1500,
        effect: {
          opacity: 0
        }
      }
    }
  }, {
    duration: 500,
    effect: {
      translateY: '100px'
    }
  }],

  actions: {
    transitionIn(transition) {
      Ember.set(this, 'text', Ember.get(transition, 'text'));
    }
  }
});
