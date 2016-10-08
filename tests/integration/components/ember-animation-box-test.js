import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { hook, initialize as initializeHook } from 'ember-hook';

const { run, typeOf } = Ember;
const { later } = run;

moduleForComponent('ember-animation-box', 'Integration | Component | ember animation box', {
  integration: true,

  beforeEach() {
    initializeHook();
  }
});

test('it uses initial transitions', function(assert) {
  assert.expect(1);

  this.set('transitions', Ember.A([{ effect: { opacity: 0.4 } }]));

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'transition executed');
});

test('it uses added transitions', function(assert) {
  assert.expect(1);

  this.set('transitions', []);

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  this.set('transitions', Ember.A([{ effect: { opacity: 0.4 } }]));

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'transition executed');
});

test('it processes the transitions sequentially', function(assert) {
  assert.expect(2);

  this.set('transitions', Ember.A([{ effect: { opacity: 0.6 } }, { effect: { padding: '1290px' } }, { effect: { opacity: 0.4 } }]));

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'transitions executed in correct order');
  assert.equal(this.$(hook('ember_animation_box')).css('padding'), '1290px', 'all transitions executed');
});

test('it queues multiple transition settings', function(assert) {
  assert.expect(2);

  const done = assert.async();

  run(() => {
    const transitions = Ember.A([{ effect: { padding: '1290px' } }]);

    this.set('transitions', transitions);

    this.render(hbs`{{ember-animation-box transitions=transitions}}`);

    transitions.pushObject({ effect: { opacity: 0.6 } });
    transitions.pushObject({ effect: { opacity: 0.4 } });

    later(() => {
      assert.equal(this.$(hook('ember_animation_box')).css('padding'), '1290px', 'initial transitions respected');
      assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'subsequent transitions executed in order');

      done();
    }, 25);
  });
});

test('it can target a specific child element', function(assert) {
  assert.expect(2);

  this.set('transitions', Ember.A([{ element: '.child', effect: { padding: '1290px' } }]));

  this.render(hbs`
    {{#ember-animation-box transitions=transitions}}
      <div class='child'></div>
    {{/ember-animation-box}}
  `);

  assert.equal(this.$(hook('ember_animation_box')).css('padding'), '0px', 'box was not transitioned');
  assert.equal(this.$('.child').css('padding'), '1290px', 'child was transitioned');
});

test('transitions can be delayed', function(assert) {
  assert.expect(2);

  const done = assert.async();

  this.set('transitions', Ember.A([{ effect: { opacity: 0.6 } }, { duration: 10 }, { effect: { opacity: 0.4 } }]));

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.6, 'before delay');

  later(() => {
    assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'after delay');

    done();
  }, 25);
});

test('delays are ignored if `isInstant`', function(assert) {
  assert.expect(1);

  this.set('transitions', Ember.A([{ effect: { opacity: 0.6 } }, { duration: 10 }, { effect: { opacity: 0.4 } }]));

  this.render(hbs`{{ember-animation-box transitions=transitions isInstant=true}}`);

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'before delay');
});

test('content can be cross faded in', function(assert) {
  assert.expect(8);

  const done = assert.async();

  this.set('transitions', Ember.A([{
    crossFade: {
      in: {
        duration: 50,
        effect: { opacity: 0.6 }
      },
      out: {
        duration: 50,
        effect: { opacity: 0 }
      }
    }
  }]));

  this.render(hbs`
    {{#ember-animation-box transitions=transitions animationAdapter="velocity"}}
      <div data-test={{hook "test_div"}}></div>
    {{/ember-animation-box}}
  `);

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 1, 'animation box is unaffected');
  assert.equal(this.$(hook('ember_animation_box')).children().length, 2, 'cloned box added');
  assert.equal(this.$(hook('test_div')).length, 2, 'content cloned');
  assert.equal(parseFloat(this.$(hook('ember_animation_box')).children().first().css('opacity')).toFixed(1), 0, 'active box opacity rising from 0');
  assert.equal(parseFloat(this.$(hook('ember_animation_box')).children().last().css('opacity')).toFixed(1), 1, 'cloned box opacity falling from 0');

  later(() => {
    assert.equal(parseFloat(this.$(hook('ember_animation_box')).children().first().css('opacity')).toFixed(1), 0.6, 'active box arrives at destination');
    assert.equal(this.$(hook('ember_animation_box')).children().length, 1, 'cloned box removed');
    assert.equal(this.$(hook('test_div')).length, 1, 'cloned content removed');

    done();
  }, 75);
});

test('`externalAction` called when external', function(assert) {
  assert.expect(2);

  const external = {
    foo: 'bar'
  };

  this.set('externalAction', (transition, resolve) => {
    assert.equal(transition, external, 'passes transition');
    assert.equal(typeOf(resolve), 'function', 'passes resolve');
  });

  this.set('transitions', Ember.A([{ external }]));

  this.render(hbs`
    {{#ember-animation-box transitions=transitions animationAdapter="velocity" externalAction=(action externalAction)}}
      <div data-test={{hook "test_div"}}></div>
    {{/ember-animation-box}}
  `);
});

test('`in` callback is executed when crossFading', function(assert) {
  assert.expect(1);

  const crossFade = {
    cb() {
      assert.ok(true, 'it executes the callback');
    },
    in: {
      duration: 50,
      effect: { opacity: 0.6 }
    },
    out: {
      duration: 50,
      effect: { opacity: 0 }
    }
  };

  this.set('transitions', Ember.A([{ crossFade }]));

  this.render(hbs`
    {{#ember-animation-box transitions=transitions animationAdapter="velocity"}}
      <div data-test={{hook "test_div"}}></div>
    {{/ember-animation-box}}
  `);
});

test('didCompleteQueue is executed after last transition completes', function(assert) {
  assert.expect(1);

  const done = assert.async();
  let hasCompleted = false;

  this.set('didCompleteQueue', () => assert.ok(hasCompleted, 'it has completed the queue'));
  this.set('transitions', Ember.A([{ effect: { opacity: 0.6 } }, { duration: 10 }, { effect: { opacity: 0.4 } }]));

  this.render(hbs`{{ember-animation-box transitions=transitions didCompleteQueue=(action didCompleteQueue)}}`);

  later(() => {
    hasCompleted = true;
  }, 9);

  later(() => {
    done();
  }, 25);
});

test('transitions are deleted after entering queue', function(assert) {
  assert.expect(2);

  const done = assert.async();

  const transitions = Ember.A([
    { effect: { padding: '123px' } },
    { duration: 10 },
    { effect: { padding: '1290px' } }
  ]);

  this.set('transitions', transitions);

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  later(() => {
    assert.equal(this.$(hook('ember_animation_box')).css('padding'), '1290px', 'padding queue completes');

    transitions.pushObject({ effect: { padding: '321px' } });
  }, 25);

  later(() => {
    assert.equal(this.$(hook('ember_animation_box')).css('padding'), '321px', 'old transitions not run again');

    done();
  }, 50);
});

test('multiple queues can run concurrently', function(assert) {
  assert.expect(3);

  const done = assert.async();

  this.set('transitions', Ember.A([
    { effect: { opacity: 0.6 } },
    { queue: 'padding', effect: { padding: '123px' } },
    { queue: 'padding', duration: 10 },
    { queue: 'padding', effect: { padding: '1290px' } },
    { effect: { opacity: 0.4 } }
  ]));

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  assert.equal(parseFloat(this.$(hook('ember_animation_box')).css('opacity')).toFixed(1), 0.4, 'main queue not delayed');
  assert.equal(this.$(hook('ember_animation_box')).css('padding'), '123px', 'padding queue delayed');

  later(() => {
    assert.equal(this.$(hook('ember_animation_box')).css('padding'), '1290px', 'padding queue completes');

    done();
  }, 25);
});

test('last transition can be a custom queue', function(assert) {
  assert.expect(2);

  const done = assert.async();

  this.set('transitions', Ember.A([
    { queue: 'padding', effect: { padding: '123px' } },
    { queue: 'padding', duration: 10 },
    { queue: 'padding', effect: { padding: '1290px' } }
  ]));

  this.render(hbs`{{ember-animation-box transitions=transitions}}`);

  assert.equal(this.$(hook('ember_animation_box')).css('padding'), '123px', 'padding queue delayed');

  later(() => {
    assert.equal(this.$(hook('ember_animation_box')).css('padding'), '1290px', 'padding queue completes');

    done();
  }, 25);
});
