angular.module('MetronicApp').controller('views.prompt.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model',  'dataFactory',
        function ($scope, settings, $uibModalInstance, model, dataFactory) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
           
            vm.save = function () {
                if (!vm.model.id && (!vm.model.address || vm.model.address == undefined || vm.model.address == null)) {
                    abp.notify.warn("请先上传资源");
                    return;
                }
                vm.model.state = vm.model.state ? 1 : 0;
                dataFactory.action(vm.url, "", null, vm.model).then(function (res) {
                    if (res.result == "1") {
                        $uibModalInstance.close();
                    } else {
                        abp.notify.error("保存失败,请重试");
                    }
                });
            };
            vm.cancel = function () {
                $uibModalInstance.dismiss();
            };
          
        }]);
