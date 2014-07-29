angular.module('canelable-promise').
factory('promiseC', ['$q',
  function($q) {

    function State() {
      this.canceled = false;
    }

    function CancelablePromise(promise, state) {
      this._promise = promise;
      this._state = state;
    }

    CancelablePromise.prototype = Object.create($q.defer().promise);
    CancelablePromise.prototype.constructor = CancelablePromise;

    CancelablePromise.prototype.cancel = function() {
      this._state.canceled = true;
      return this;
    };

    CancelablePromise.prototype.then = function(successCb, errorCb) {

      var self = this;
      if (this._state.canceled)
        return new CancelablePromise($q.reject(), this._state);

      var new_promise = this._promise.then(function(data) {
        if (self._state.canceled) return $q.reject();
        return (successCb || function(data) {
          return data;
        })(data);
      }, errorCb || function(data) {
        return $q.reject(data);
      });

      return new CancelablePromise(new_promise, this._state);
    };

    return {
      'wrap': function(promise) {
        return new CancelablePromise(promise, new State());
      }
    };
  }
]);
