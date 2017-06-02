angular.module('MetronicApp').controller('views.prompt.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model',  'dataFactory','appSession',
        function ($scope, settings, $uibModalInstance, model, dataFactory, appSession) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.tips = {};
            vm.gift;
            if (model.id) {
                vm.url = "api/tips/update";
            } else {
                vm.url = "api/tips/add";
            }

            vm.save = function () {
                vm.tips.org_id = appSession.orgid;
                dataFactory.action(vm.url, "", null, vm.tips).then(function (res) {
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
          

            vm.init = function () {
                if (model.id) {
                    dataFactory.action("api/tips/getTips?id=" + model.id, "GET", null, {}).then(function (res) {
                        if (res.result == "1") {
                            vm.tips = res.data;
                        } else {
                            abp.notify.error("获取失败,请重试");
                        }
                    });
                }
            }
            vm.init();

        }]);
