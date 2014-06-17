(function() {
  var app = angular.module('contact-list', []);
  app.controller('ListController', [ '$http', function($http){
    var list = this;
    list.contacts = [];
    this.get_error = false;
    this.post_error = false;
    this.post_success = false;
    $http.get('contacts.json').success(function(data){
      list.contacts = data.contacts;
    }).error(function(){
      list.get_error = true;
    });
    for (var i=0; i < this.contacts.length; i++) {
      this.contacts[i].active = false;
      this.contacts[i].edit_mode = false;
    }
    this.delete_contact = function(index) {
      this.contacts.splice(index, 1);
    }
    this.add_contact = function(element) {
      this.contacts.push(element);
    }
    this.edit_contact = function(index, element) {
      for (var key in element) {
        this.contacts[index][key] = element[key];
      }
    }
    this.up_contact = function(index) {
      if (index != 0) {
        var b = this.contacts[index];
        this.contacts[index] = this.contacts[index-1];
        this.contacts[index-1] = b;
      }
    }
    this.down_contact = function(index) {
      if (index != this.contacts.length-1) {
        var b = this.contacts[index];
        this.contacts[index] = this.contacts[index+1];
        this.contacts[index+1] = b;
      }
    }
    this.change_active_contact = function(contact) {
      if (contact.edit_mode) {
        return;
      }
      if (contact.active === false) {
        for (var i=0; i < this.contacts.length; i++) {
          this.contacts[i].active = false;
        }
      }
      contact.active = !contact.active;
    }

    this.deactivate_all = function() {
      for (var i=0; i < this.contacts.length; i++) {
        this.contacts[i].active = false;
      }
    }
    this.swap_contacts = function(index1, index2) {
      var b = this.contacts[index1];
      this.contacts[index1] = this.contacts[index2];
      this.contacts[index2] = b;
    }
    this.save_all = function() {
      var contacts_to_recieve = [];
      for (var i = 0; i < this.contacts.length; i++) {
        contacts_to_recieve[i] = JSON.parse(JSON.stringify(this.contacts[i]));
        delete contacts_to_recieve[i].$$hashKey;
        delete contacts_to_recieve[i].active;
        delete contacts_to_recieve[i].edit_mode;
      }

      $http({url:'recieve',
             method: 'POST',
             data: {"contacts": contacts_to_recieve},
             headers: {'Content-Type': 'application/json'}
      }).success(function(data){
         list.post_success = true;
      }).error(function() {
         list.post_error = true;
      });
    }
    this.to_edit_mode = function(index) {
      this.contacts[index].edit_mode = true;
      this.contacts[index].active = false;
    }
    this.helper = function(event) {
      event.target.blur();
      event.stopPropagation();
    }
  }]);

  app.controller('AddingController', function($scope) {
    this.state = false; //false-видна кнопка, true-видна форма
    this.element = {};
    this.change_state = function(event) {
      this.state = !this.state;
      //сделать скролл к форме ????
    }
    this.submit = function(form, submit_flag){
      if (submit_flag) {
        if (form.$valid) {
          $scope.list.add_contact(this.element);
        } else return;
      }
      this.element = {};
      this.change_state();
      form.$setPristine(true);
    }
    this.helper = function(event) {
      event.target.blur();
      event.stopPropagation();
    }
  });

  app.controller('EditingController', function($scope) {
    this.element = {};
    this.submit = function(index, form, submit_flag){
      if (submit_flag) {
        if (form.$valid) {
          $scope.list.edit_contact(index, this.element);
        } else return;
      }
      this.element = {};
      $scope.list.contacts[index].edit_mode = false;
      form.$setPristine(true);
    }
    this.helper = function(event) {
      event.target.blur();
      event.stopPropagation();
    }
  });

  app.directive('draggable', function() {
    return function(scope, element) {
      var el = element[0];

      el.draggable = true;

      el.addEventListener(
        'dragstart',
        function(e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('index', scope.$index);
          this.classList.add('drag');
          return false;
        },
        false
        );
      el.addEventListener(
        'dragend',
        function(e) {
          this.classList.remove('drag');
          return false;
        },
        false
      );
      el.addEventListener(
        'dragover',
        function(e) {
          if (e.preventDefault) {
            e.preventDefault();
          }
          e.dataTransfer.dropEffect = 'move';
          return false;
        },
        false
      );
      el.addEventListener(
        'dragenter',
        function(e) {
          this.classList.add('over');
          return false;
        },
        false
      );
      el.addEventListener(
        'dragleave',
        function(e) {
          this.classList.remove('over');
          return false;
        },
        false
      );
      el.addEventListener(
        'drop',
        function(e) {
          if (e.stopPropagation) {
            e.stopPropagation();
          }
          this.classList.remove('over');
          var drag_index = e.dataTransfer.getData('index');
          if (drag_index != scope.$index) {
            scope.$apply(function() {
              scope.list.swap_contacts(scope.$index, drag_index);
            });
          }
          return false;
        },
        false
      );
    }
  });


})();
