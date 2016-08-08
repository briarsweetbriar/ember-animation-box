[![npm version](https://badge.fury.io/js/ember-animation-box.svg)](https://badge.fury.io/js/ember-animation-box)
[![Build Status](https://travis-ci.org/null-null-null/ember-animation-box.svg?branch=master)](https://travis-ci.org/null-null-null/ember-animation-box)

# `ember-animation-box`

For most your Ember animation needs, you should turn to [liquid-fire](https://github.com/ember-animation/liquid-fire). `ember-animation-box` provides a much more limited feature set, but also a more dynamic API. You can pass `transitions` into it at runtime, rather than having to hard-code them into a `transitions.js` file. For most web applications, `liquid-fire` is the safer choice, but we needed something a little more flexible for the [Affinity Engine](https://github.com/affinity-engine/affinity-engine) game engine.

## Installation

`ember install ember-animation-box`

## Usage

The `ember-animation-box` should wrap the content you want to animate:

```hbs
{{#ember-animation-box transitions=transitions animationAdapter="velocity"}}
  <h1>My Html</h1>
  {{my-component}}
{{/ember-animation-box}}
```

### `animationAdapter`

The `animationAdapter` let's you specify which animation library this box should use. It defaults to using jquery, which won't actually animate the transitions. (It simply changes the css values.) The only other adapter build-in to `ember-animation-box` is 'velocity', which uses [Velocity.js](https://github.com/julianshapiro/velocity). You'll still need to include Velocity in your repo to use it, perhaps through the [ember-cli-velocity](https://github.com/EmberSherpa/ember-cli-velocity) addon.

### `transitions`

The `transitions` param should be an array of transition objects. Currently, `ember-animation-box` supports three types of transitions:

#### Standard Transitions

```js
{
  duration: 100, // in millliseconds
  otherOptions: 'foobar',
  effect: {
    opacity: 0.7
    width: '50px'
  }
}
```

The standard transition contains an `effect` object, which has an array of css attributes/values. Outside of the `effect` object you can pass in additional options supported by your animation library, such as `duration`.

#### Cross Fade

```js
{
  crossFade: {
    in: {
      duration: 500,
      effect: {
        opacity: 1
      }
    },
    out {
      duration: 250,
      effect: {
        opacity: 0
      }
    }
  }
}
```

If the `transition` contains a `crossFade` object, then it'll clone the current content of your animation box and perform the `out` transition on it. It'll also trigger the `transitionIn` action (prompting you to change the content of your box), and then execute the `in` transition. To get this working, you'll need to pass in an additional parameter to the box:

```hbs
{{#ember-animation-box transitions=transitions animationAdapter="velocity" transitionIn=(action "changeContent")}}
  {{text}}
{{/ember-animation-box}}
```

```js
export default Ember.Component.extend({
  text: 'Initial text.',

  actions: {
    changeContent(transition) { // `transition` is the `in` transtion
      const newText = transtion.text; // you can set whatever arbitrary value on the `in` object that you need

      this.set('text', newText);
    }
  }
})
```

#### Delay

```js
{
  duration: 100
}
```

To get a simple delay before the next transition, provide a transition without an `effect` or `crossFade` object.
