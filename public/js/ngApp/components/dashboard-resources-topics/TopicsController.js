(function () {
  'use strict';

  angular.
  module('KliikoApp').
  controller('TopicsController', TopicsController);

  TopicsController.$inject = ['dbg'];
  function TopicsController(dbg) {
    dbg.log2('#TopicsController controller started');

    var vm = this;

    vm.list = [
      {name: 'This Is topic name', id: 'topic100500', sessions: [{name:'That is session Name', id: 1},{name:'That is session Name2', id: 2}]},
      {name: 'This Is topic name2', id: 'topic100500', sessions: [{name:'That is session Name2', id: 2}]},
      {name: 'This Is topic name3', id: 'topic100500', sessions: [{name:'That is session Name3', id: 3}]},
      {name: 'This Is topic name4', id: 'topic100500', sessions: [{name:'That is session Name2', id: 2},{name:'That is session Name2', id: 2},{name:'That is session Name4', id: 4}]}
    ]
  }


})();