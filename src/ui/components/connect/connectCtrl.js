'use strict';

angular.module('app').controller('connectCtrl', [
  '$scope',
  '$rootScope',
  '$timeout',
  '$log',
  'alertService',
  'connectionCache',
  function($scope, $rootScope, $timeout, $log, alertService, connectionCache) {
    const connectionModule = require('lib/modules/connection');

    $scope.currentPage = 'list';

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

    $scope.selectedConnection = null;

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

    $scope.addConnection = function(addConnectionForm) {
      $scope.addConnectionFormSubmitted = true;

      if (!addConnectionForm.$valid) return;

      connectionModule.create($scope.addConnectionForm)
        .then(function(connection) {
          $timeout(function() {
            $scope.connections.push(connection);

            $scope.currentScreen = $scope.screens.LIST;

            alertService.success('Connection added');
          });
        })
        .catch(function(err) {
          $timeout(function() {
            alertService.error(err);
            console.log(err);
          });
        });
    };

    $scope.editConnection = function(editConnectionForm) {
      if (!editConnectionForm.$valid) return;

      connectionModule.update($scope.selectedConnection.id, $scope.selectedConnection)
        .then(function(connection) {
          $timeout(function() {
            connectionCache.updateById($scope.selectedConnection.id, connection);

            $scope.selectedConnection = _.extend($scope.selectedConnection, connection);

            $scope.currentScreen = $scope.screens.LIST;

            alertService.success('Connection updated');
          });
        })
        .catch(function(err) {
          $timeout(function() {
            alertService.error(err);
            console.log(err);
          });
        });
    };

    $scope.removeConnection = function(connection, $event) {
      if (!connection) return;
      if ($event) $event.preventDefault();

      connectionModule.delete(connection.id)
        .then(function() {
          $timeout(function() {
            var index = $scope.connections.indexOf(connection);

            if (index >= 0) $scope.connections.splice(index, 1);

            connectionCache.removeById(connection.id);

            $scope.currentScreen = $scope.screens.LIST;

            alertService.success('Connection removed');
          });
        })
        .catch(function(err) {
          $timeout(function() {
            alertService.error(err);
            console.log(err);
          });
        });
    };
  }
]);
