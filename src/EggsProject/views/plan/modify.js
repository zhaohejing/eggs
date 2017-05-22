(function () {
    angular.module('MetronicApp').controller('views.plan.modify',
        ['$scope', 'settings', '$uibModal','$state','$stateParams','dataFactory',
        function ($scope, settings, $uibModal, $state, $stateParams, dataFactory) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        var vm = this;
        vm.planId = $stateParams.id;
        vm.scenes = [{ scene_type: 1, scene_name: "购买之后" }, { scene_type: 2, scene_name: "每日游戏" }];
        vm.games = [{ id: 1, name: "砸蛋" }, { id: 2, name: "飞镖" }];
        vm.plan = {};
        vm.sence = { scene_type:1 };
        if (vm.planId) {
            dataFactory.action("api/package/detail", "", null, { id: vm.planId })
              .then(function (res) {
                  if (res.result == "1") {
                      vm.plan = res.data;
                      for (var i = 0; i < vm.plan.resources.length; i++) {
                          vm.plan.resources[i].order = i;
                      }
                      vm.checktable = vm.plan.resources;
                  }
              });
        }
      
        vm.cancel = function () {
            $state.go("adsensepack");
        }
            //保存
        vm.save = function () {
            if (vm.checktable.length <= 0) {
                abp.notify.warn("请选择资源");
                return;
            }
            vm.plan.resourceIds = _.map(vm.checktable, function (item) {
                return item.id
            });
            var url = vm.plan.id && vm.plan.id > 0 ? "api/package/update" : "api/package/add";
            vm.plan.state = vm.plan.state ? 1 : 0;
            dataFactory.action(url, "", null, vm.plan).then(function (res) {
                if (res.result == "1") {
                    abp.notify.success("成功");
                    $state.go("adsensepack");
                } else {
                    abp.notify.error(res.errorMsg);
                }
            })
        }
   
      
        vm.remove = function (row) {
            vm.checktable.splice($.inArray(row, vm.checktable), 1);
        }
    }]);
})();

