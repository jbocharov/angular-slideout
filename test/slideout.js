'use strict';

describe('Directive: slideoutContainer', function () {

  // load the directive's module
  beforeEach(module('warmerIoWebApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<slideout-container></slideout-container>');
    element = $compile(element)(scope);
    //expect(element.text()).toBe('this is the slideoutContainer directive');
  }));
});
