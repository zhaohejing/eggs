angular.module('MetronicApp').controller('views.advertising.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model', 'dataFactory','$filter',
        function ($scope, settings, $uibModalInstance, model, dataFactory,$filter) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.model = model;
            vm.date = {
                leftopen: false,
                rightopen: false,

                inlineOptions: {
                    showWeeks: false
                },
                dateOptions: {
                    //dateDisabled: disabled,
                    formatYear: 'yyyy',
                    maxDate: new Date(5000, 1, 1),
                    minDate: new Date(1900, 1, 1),
                    startingDay: 1
                },
                openleft: function () {
                    vm.date.leftopen = !vm.date.leftopen;
                },
                openright: function () {
                    vm.date.rightopen = !vm.date.rightopen;
                }
            }
            vm.save = function () {
                if (!vm.model.atonce) {
                    vm.model.atonce = false;
                    if (!vm.model.startTime || !vm.model.endTime) {
                        abp.notify.warn("请选择分发时间段");
                        return;
                    } else {
                        vm.model.startTime = $filter('date')(vm.model.startTime, "yyyy-MM-dd");
                        vm.model.endTime = $filter('date')(vm.model.endTime, "yyyy-MM-dd");
                    }
                } else if (vm.model.atonce) {
                    if ( !vm.model.endTime) {
                        abp.notify.warn("请选择截止时间");
                        return;
                    } else {
                        vm.model.endTime = $filter('date')(vm.model.endTime, "yyyy-MM-dd");
                    }
                }


                dataFactory.action("api/distribution/add", "", null, vm.model).then(function (res) {
                    if (res.result == "1") {
                        abp.notify.success("分发成功");
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
