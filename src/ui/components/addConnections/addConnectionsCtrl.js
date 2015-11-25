'use strict';

angular.module('app').controller('addConnectionsCtrl', [
  '$scope',
  '$rootScope',
  '$timeout',
  '$log',
  'alertService',
  'connectionCache',
  function($scope, $rootScope, $timeout, $log, alertService, connectionCache) {
    const connectionModule = require('lib/modules/connection');

    $scope.setTitle('MongoDb Connections');

    $scope.connections = [];

    connectionModule.list()
      .then(function(connections) {
        $timeout(function() {
          $scope.connections = connections;
        });
      })
      .catch(function(response) {
        $timeout(function() {
          $log.error(response);
        });
      });

    $scope.addConnectionForm = {
      auth: {}
    };
    $scope.addConnectionFormSubmitted = false;

    $scope.isConnected = function(connection) {
      if (!connection) return false;

      return connectionCache.existsByName(connection.name);
    };

    $scope.connect = function(connection, $event) {
      if (!connection) return;
      if ($event) $event.preventDefault();

      if (!$scope.isConnected(connection)) {
        connectionCache.add(connection);
      } else {
        connectionCache.removeById(connection.id);
      }
    };
  }
]);
