import Ember from 'ember';

const {
  Controller,
  computed,
  set
} = Ember;

export default Controller.extend({
  text: 'I am the original text. . . .',

  transitions: computed(function() {
    const _this = this;

    return Ember.A([{
      duration: 500,
      effect: {
        '@media (min-width: 500px)': {
          translateX: '100px'
        },
        translateY: '100px'
      }
    }, {
      crossFade: {
        cb() {
          set(_this, 'text', 'I am new text!!!');
        },
        in: {
          duration: 100,
          effect: {
            opacity: 1
          }
        },
        out: {
          duration: 150,
          effect: {
            opacity: 0
          }
        }
      }
    }, {
      external: {
        duration: 100
      }
    }, {
      crossFade: {
        cb() {
          set(_this, 'text', 'I am newer text!!!');
        },
        in: {
          duration: 100,
          effect: {
            opacity: 1
          }
        },
        out: {
          duration: 150,
          effect: {
            opacity: 0
          }
        }
      }
    }, {
      crossFade: {
        cb() {
          set(_this, 'text', 'I am newest text!!!');
        },
        in: {
          duration: 100,
          effect: {
            opacity: 1
          }
        },
        out: {
          duration: 150,
          effect: {
            opacity: 0
          }
        }
      }
    }, {
      duration: 50,
      effect: {
        translateY: '100px'
      }
    }]);
  }),

  actions: {
    externalAction(transition, resolve) {
      Ember.run.later(() => {
        resolve();
        console.log('external action complete'); // eslint-disable-line
      }, transition.duration);
    }
  }
});
