(function () {
    angular.module('MetronicApp').controller('views.adsensepack.modify',
        ['$scope', 'settings', '$uibModal','$state','$stateParams','dataFactory',
        function ($scope, settings, $uibModal, $state, $stateParams, dataFactory) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });
        var vm = this;
        vm.packId = $stateParams.id;

        vm.filter = {};
        vm.pack = {};
        vm.checktable = [];
        if (vm.packId) {
            dataFactory.action("api/package/detail", "", null, { id: vm.packId })
              .then(function (res) {
                  if (res.result == "1") {
                      vm.pack = res.data;
                      for (var i = 0; i < vm.pack.resources.length; i++) {
                          vm.pack.resources[i].order = i;
                      }
                      vm.checktable = vm.pack.resources;
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
            vm.pack.resourceIds = _.map(vm.checktable, function (item) {
                return item.id
            });
            var url = vm.pack.id && vm.pack.id > 0 ? "api/package/update" : "api/package/add";
            vm.pack.state = vm.pack.state ? 1 : 0;
            dataFactory.action(url, "", null, vm.pack).then(function (res) {
                if (res.result == "1") {
                    abp.notify.success("成功");
                    $state.go("adsensepack");
                } else {
                    abp.notify.error(res.errorMsg);
                }
            })
        }
            //添加广告
        vm.addadsense = function () {
            var ids = [];
            if (vm.checktable.length>0) {
                for (var i = 0; i < vm.checktable.length; i++) {
                    ids.push(vm.checktable[i].id);
                }
            }
            var modal = $uibModal.open({
                templateUrl: 'views/adsensepack/modal.html',
                controller: 'views.adsensepack.modal as vm',
                backdrop: 'static',
                size: 'lg',//模态框的大小尺寸
                resolve: {
                    model: function () { return ids },
                }
            });
            modal.result.then(function (response) {
                if (response) {
                    var y = 0;
                    var arr = [];
                    for (var i in response) {
                        response[i].order = y++;
                        vm.checktable.push(response[i]);
                    }
                  //  vm.checktable = arr;
                }
            })
        }
        vm.sort = function (row, num) {
            var p = row.order - 1;
            var n = row.order + 1;
            var prev = vm.checktable[p];
            var next = vm.checktable[n];
            var temp ;
            if (num==1) {//向上
                if (prev==undefined) {
                    return;
                }
                temp = prev.order;
                prev.order = row.order;
                row.order = temp;
            } else {
                if (next==undefined) {
                    return;
                }
                temp = next.order;
                next.order = row.order;
                row.order = temp;
            }
            vm.checktable.sort(function (x, y) {
                return x.order - y.order
            });
        }
        vm.remove = function (row) {
            vm.checktable.splice($.inArray(row, vm.checktable), 1);
        }
    }]);
})();

