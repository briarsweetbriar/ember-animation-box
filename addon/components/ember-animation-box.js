import Ember from 'ember';
import layout from '../templates/components/ember-animation-box';
import { AnimatableMixin } from 'ember-animation-box';

const {
  Component,
  get,
  isNone,
  set,
  typeOf
} = Ember;

const {
  RSVP: {
    all
  }
} = Ember;

export default Component.extend(AnimatableMixin, {
  layout,
  hook: 'ember_animation_box',
  _activeInstanceClass: 'ember-animation-box-active-instance',

  _crossFade(transition) {
    const activeInstanceClass = get(this, '_activeInstanceClass');
    const $active = this.$().children(`.${activeInstanceClass}`);
    const $clone = $active.clone().removeClass(activeInstanceClass);
    const cb = get(transition, 'crossFade.cb');
    const transitionIn = get(transition, 'crossFade.in');
    const transitionOut = get(transition, 'crossFade.out');

    const activeCanvases = [];
    $active.find('canvas').each(function() {
      activeCanvases.push(this);
    });

    $clone.find('canvas').each(function(index) {
      this.getContext('2d').drawImage(activeCanvases[index], 0, 0);
    });

    if (isNone(get(transitionIn, 'easing'))) {
      set(transitionIn, 'easing', get(this, 'animatorInstance.easingIn'));
    }

    if (isNone(get(transitionOut, 'easing'))) {
      set(transitionOut, 'easing', get(this, 'animatorInstance.easingOut'));
    }

    if (isNone(get(transitionOut, 'duration'))) {
      set(transitionOut, 'duration', get(transitionIn, 'duration'));
    }

    if (!get(transitionOut, 'static')) {
      $clone.css({ position: 'absolute', top: 0, left: 0 });
    }

    $active.before($clone).css({ opacity: 0 });

    if (typeOf(cb) === 'function') {
      cb();
    }

    const outPromise = this._performAnimation($clone.get(0), transitionOut).then(() => {
      $clone.remove();
    });

    const inPromise = this._performAnimation($active.get(0), transitionIn);

    return all([outPromise, inPromise]);
  }
});
