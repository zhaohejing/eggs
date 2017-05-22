angular.module('MetronicApp').controller('views.coupon.modal',
    ['$scope', 'settings', '$uibModalInstance', 'model',  'dataFactory',
        function ($scope, settings, $uibModalInstance, model, dataFactory) {
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();

            });
            var vm = this;
            vm.url = "";
            vm.model = {};
            vm.gift;
            if (model.id) {
                vm.url = "api/card/update";
            } else {
                vm.url = "api/card/add";
            }
            vm.date = {
                leftopen: false,
                rightopen: false,
                inlineOptions: {
                    showWeeks: false
                },
                dateOptions: {
                    //dateDisabled: disabled,
                    formatYear: 'yyyy',
                    formatMonth: 'MM',
                    formatDay: 'dd',
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

            vm.gifts = [];
            vm.type = [{ id: 1, name: "代金券" }, { id: 2, name: "折扣券" }, { id: 3, name: "礼品券" }];
            vm.initgift = function () {
                dataFactory.action("api/card/getGiftList", "", null, {}).then(function (res) {
                    if (res.result == "1") {
                        vm.gifts = res.data;
                    } else {
                        abp.notify.error("保存失败,请重试");
                    }
                });
                
            }
            vm.init = function () {
                if (model.id) {
                    dataFactory.action("api/card/getCard?id="+model.id, "GET", null, {}).then(function (res) {
                        if (res.result == "1") {
                            vm.model = res.data;
                        } else {
                            abp.notify.error("获取失败,请重试");
                        }
                    });
                } 
               

            }
            vm.save = function () {
                if (vm.model.date_info_type==1) {
                    vm.model.fixed_begin_term = null;
                    vm.model.fixed_term = null;
                    vm.model.begin_timestamp = Math.round(vm.model.begin_timestamp.valueOf() / 1000);
                    vm.model.end_timestamp = Math.round(vm.model.end_timestamp.valueOf() / 1000);
                } else if (vm.model.date_info_type == 2) {
                    vm.model.begin_timestamp = null;
                    vm.model.end_timestamp = null;
                    vm.model.fixed_term = null;
                } else {
                    vm.model.begin_timestamp = null;
                    vm.model.end_timestamp = null;
                    vm.model.fixed_begin_term = null;
                }
                if (vm.model.card_type==3) {
                    vm.model.gift_id = vm.gift.gift_id;
                    vm.model.gift_name = vm.gift.gift_name;
                }
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
            vm.initgift();
            vm.init();
        }]);
