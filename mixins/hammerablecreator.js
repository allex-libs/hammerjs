function createHammerableMixin (execlib) {
  'use strict';

  var lib = execlib.lib;

  function HammerableMixin (prophash) {
    this.onHammerer = onHammerInputEvent.bind(this);
    this.onPaner = onHammerPanStatic.bind(this);
    this.onSwipeer = this.onHammerSwipe.bind(this);
    this.hammer = null;
    this.hammerPos = null;
    this.lastKnownHammerPos = null;
    this.hammerDistance = null;
  }
  HammerableMixin.prototype.destroy = function () {
    this.hammerDistance = null;
    this.lastKnownHammerPos = null;
    this.hammerPos = null;
    if (this.hammer) {
      this.hammer.off('hammer.input', this.onHammerer);
      this.hammer.off('pan', this.onPaner);
      this.hammer.off('swipe', this.onSwipeer);
      this.hammer.destroy();
    }
    this.hammer = null;
    this.onSwipeer = null;
    this.onPaner = null;
    this.onHammerer = null;
  };

  HammerableMixin.prototype.createHammer = function () {
    if (this.hammer) {
      this.hammer.destroy();
    }
    this.hammer = new Hammer(this.$element[0], this.getConfigVal('hammer_native_options'));
    this.hammer.on('hammer.input', this.onHammerer);
    this.hammer.on('swipe', this.onSwipeer);
    this.hammer.on('pan', this.onPaner);
    this.$element.css('position', 'relative');
  };
  HammerableMixin.prototype.onHammerPan = function (hevnt) {
    this.$element.offset({left: this.hammerPos.left+hevnt.deltaX});
  };
  HammerableMixin.prototype.onHammerSwipe = function (hevnt) {
    //this happens after the final hammer.input event, so hammerPos is not available any more
    if (this.isDistanceWeak(hevnt)) {
      return;
    }
    if (hevnt.direction === Hammer.DIRECTION_LEFT) {
      this.onHammerSwipeLeft();
      return;
    }
    if (hevnt.direction === Hammer.DIRECTION_RIGHT) {
      this.onHammerSwipeRight();
      return;
    }
    console.warn('unrecognized direction!', hevnt.direction);
  };
  HammerableMixin.prototype.onHammerSwipeUp = function () {
  };
  HammerableMixin.prototype.onHammerSwipeDown = function () {
  };
  HammerableMixin.prototype.onHammerSwipeLeft = function () {
  };
  HammerableMixin.prototype.onHammerSwipeRight = function () {
  };
  HammerableMixin.prototype.onHammerSwipeNoDirection = function () {
  };
  HammerableMixin.prototype.resetHammerPosition = function () {
    if (this.hammerPos) {
      this.$element.offset(this.hammerPos);
      return;
    }
    console.warn('no hammerPos?');
  };

  /*
  HammerableMixin.prototype.isDistanceWeak = function (hevnt) {
    var mhd;
    if (!lib.isNumber(hevnt.distance)) {
      return true;
    }
    mhd = this.minHammerDistance();
    console.log('minHammerDistance', mhd, 'vs', hevnt.distance, 'devicePixelRatio', window.devicePixelRatio, 'whole event', hevnt);
    if (hevnt.distance<mhd) {
      console.log('weak!');
      this.resetHammerPosition();
      return true;
    }
    return false;
  };
  */
  HammerableMixin.prototype.isDistanceWeak = function (hevnt) {
    var mhd;
    if (!lib.isNumber(this.hammerDistance)) {
      return true;
    }
    mhd = this.minHammerDistance();
    console.log('minHammerDistance', mhd, 'vs', this.hammerDistance, 'devicePixelRatio', window.devicePixelRatio, 'whole event', hevnt);
    if (this.hammerDistance<mhd) {
      console.log('weak!');
      this.resetHammerPosition();
      return true;
    }
    return false;
  };
  HammerableMixin.prototype.minHammerDistance = function () {
    var ret = this.getConfigVal('hammer_min_pan_distance'),
      rcgn;
    if (lib.isNumber(ret)) {
      return ret;
    }
    if (!this.hammer) {
      return 0;
    }
    rcgn = this.hammer.get('pan');
    if (rcgn && rcgn.options && lib.isNumber(rcgn.options.threshold)) {
      return rcgn.options.threshold;
    }
    return 0;
  };
  HammerableMixin.addMethods = function (klass, parentclass) {
    lib.inheritMethods (klass, HammerableMixin
      ,'createHammer'
      ,'onHammerPan'
      ,'onHammerSwipe'
      ,'onHammerSwipeUp'
      ,'onHammerSwipeDown'
      ,'onHammerSwipeLeft'
      ,'onHammerSwipeRight'
      ,'resetHammerPosition'
      ,'isDistanceWeak'
      ,'minHammerDistance'
    );
    klass.prototype.preInitializationMethodNames = parentclass.prototype.preInitializationMethodNames.concat('createHammer');
  };

  //static methods, "this" matters
  function onHammerInputEvent (hevnt) {
    if (hevnt.isFirst) {
      this.hammerPos = this.$element.offset();
    }
    if (hevnt.isFinal) {
      console.log('final event!', hevnt.direction);
      this.isDistanceWeak(hevnt);
      this.lastKnownHammerPos = this.hammerPos;
      this.hammerPos = null;
    }
  };
  function onHammerPanStatic (hevnt) {
    if (!this.hammerPos) {
      return;
    }
    this.hammerDistance = hevnt.distance;
    //console.log('EVENT OD onHammerPan', hevnt, this.hammerPos);
    this.onHammerPan (hevnt);
  }

  return HammerableMixin;
}
module.exports = createHammerableMixin;
