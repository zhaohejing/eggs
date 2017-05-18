angular.module('MetronicApp').controller('views.payment.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model', 'dataFactory',
        function ($scope, settings, $uibModalInstance, model, dataFactory) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.model = model;
            vm.save = function () {
                if (!vm.model.list && (!vm.model.wxAccount || !vm.model.aliAccount)) {
                    abp.notify.warn("请输入要绑定的账号");
                    return;
                }
                dataFactory.action('api/orgsetting/bindOrgAccount', "", null, vm.model).then(function (res) {
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
