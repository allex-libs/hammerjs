function createLib (execlib) { 
  'use strict';

  return {
    mixins: {
      HammerableMixin: require('./mixins/hammerablecreator')(execlib)
    }
  };
}
module.exports = createLib;
