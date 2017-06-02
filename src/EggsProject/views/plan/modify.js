(function () {
    angular.module('MetronicApp').controller('views.plan.modify',
        ['$scope', 'settings', '$uibModal', '$state', '$stateParams', 'dataFactory','appSession',
        function ($scope, settings, $uibModal, $state, $stateParams, dataFactory, appSession) {
            $scope.$on('$viewContentLoaded', function () {
                // initialize core components
                App.initAjax();
            });
            var vm = this;
            vm.planId = $stateParams.id;
            //提示对象
            vm.t = {
                list: [], select: [], init: function () {
                    dataFactory.action("api/tips/getTipsList", "", null, { pageNum: 1, pageSize: 999,org_id:appSession.orgid })
              .then(function (res) {
                  if (res.result == "1") {
                      angular.forEach(res.list, function (v, i) {
                          vm.t.list.push({ tips_id: v.id, tips_name: v.tips, ticked: false });
                      })
                  }
              });
                }
            };
            vm.t.init();
            //场景
            vm.scenes = [{ scene_type: 1, scene_name: "购买之后" }, { scene_type: 2, scene_name: "每日游戏" }];
            //代金券类型
            vm.type = [{ id: 1, name: "代金券" }, { id: 2, name: "折扣券" }, { id: 3, name: "礼品券" }];
            //游戏类型
            vm.games = [{ id: 1, name: "砸蛋" }, { id: 2, name: "飞镖" }];
            vm.plan = {};
            if (vm.planId) {
                dataFactory.action("api/plan/getPlan?id=" + vm.planId, "GET", null, {})
                  .then(function (res) {
                      if (res.result == "1") {
                          vm.plan = res.data;
                          vm.c.cardlist = vm.plan.cardList;
                          vm.o.coll = vm.plan.machineList;

                          angular.forEach(vm.plan.tipsList, function (v, i) {
                              angular.forEach(vm.t.list, function (b, ii) {
                                  if (v.tips_id == b.tips_id) {
                                      b.ticked = true;
                                  }
                              })
                          });

                      }
                  });
            } else {
                abp.notify.warn("请选择方案再操作");
                $state.go("plan");
            }
            //卡券对象
            vm.c = {
                temp: {},
                cardlist: [],
                tempcate: {},
                tempcard: {},
                cards: [],
                cates: [],
                selectcate: function () {
                    if (!vm.c.tempcate) {
                        return;
                    }
                    var arr = [];
                    if (vm.c.cardlist > 0) {
                        angular.forEach(vm.c.cardlist, function (v, i) {
                            arr.push(v.card_id);
                        });
                    }
                    dataFactory.action("api/plan/getCardList", "", null, { card_type: vm.c.tempcate.id, card_ids: arr,org_id:appSession.orgid })
                    .then(function (res) {
                        if (res.result == "1") {
                            vm.c.cards = res.data;
                        }
                    });
                },
                selectcard: function () {
                    vm.c.temp.card_type = vm.c.tempcate.id;
                    vm.c.temp.card_id = vm.c.tempcard.card_id;
                    vm.c.temp.title = vm.c.tempcard.title;
                    vm.c.temp.quantity = vm.c.tempcard.quantity;
                    vm.c.temp.winning_rate = 0;
                },
                remove: function (row) {
                    vm.c.cardlist.splice($.inArray(row, vm.c.cardlist), 1);
                }, add: function () {
                    if (!vm.c.temp.card_id) {
                        abp.notify.warn("请选则卡片再添加"); return;
                    }
                    else if (vm.c.temp.winning_rate > 70) {
                        abp.notify.warn("单个中奖概率最好为70%"); return;
                    }
                    vm.c.cardlist.push(vm.c.temp);
                    vm.c.tempcate = {};
                    vm.c.tempcard = {};
                    vm.c.temp = {};
                }
            }
            //组织机构对象
            vm.o = {
                coll: [],
                final: {},
                org: {}, point: {}, device: {},
                orgs: [],
                points: [],
                devices: [],
                getorgs: function () {
                    dataFactory.action("api/plan/selectOrgList?org_id="+appSession.orgid, "GET", null, {})
                .then(function (res) {
                    if (res.result == "1") {
                        vm.o.orgs = res.data;
                    }
                });
                },
                getpoints: function () {
                    if (!vm.o.org) {
                        return;
                    }
                    dataFactory.action("api/plan/selectSpotList?org_id=" + vm.o.org.org_id, "GET", null, {})
                 .then(function (res) {
                     if (res.result == "1") {
                         vm.o.points = res.data;
                     }
                 });
                },
                getdevices: function () {
                    if (!vm.o.point) {
                        return;
                    }
                    dataFactory.action("api/plan/selectMachineList?spot_id=" + vm.o.point.spot_id, "GET", null, {})
                 .then(function (res) {
                     if (res.result == "1") {
                         vm.o.devices = res.data;
                     }
                 });
                },
                selectOrg: function () {
                    vm.o.getpoints();
                },
                selectPoint: function () {
                    vm.o.getdevices();
                },
                selectDevice: function () {
                    vm.o.final.machine_code = vm.o.device.machine_code;
                },
                add: function () {
                    if (vm.o.org.org_id) {
                        vm.o.final.org_id = vm.o.org.org_id;
                        vm.o.final.org_name = vm.o.org.org_name;
                    }
                    if (vm.o.device.machine_code) {
                        vm.o.final.machine_name = vm.o.device.machine_name;
                        vm.o.final.machine_code = vm.o.device.machine_code;
                    }
                    if (vm.o.point.spot_id) {
                        vm.o.final.spot_id = vm.o.point.spot_id;
                        vm.o.final.spot_name = vm.o.point.spot_name;
                    }

                    vm.o.coll.push(vm.o.final);
                    vm.o.final = {};
                    vm.o.org = {};
                    vm.o.point = {};
                    vm.o.device = {};
                },
                remove: function (row) {
                    vm.o.coll.splice($.inArray(row, vm.o.coll), 1);
                }
            }
            vm.o.getorgs();
            vm.cancel = function () {
                $state.go("plan");
            }
            //保存
            vm.save = function () {
                if (!vm.plan.scene_type) {
                    abp.notify.warn("请选择场景");
                    return;
                }
                if (!vm.plan.game_id) {
                    abp.notify.warn("请选择游戏");
                    return;
                }
                if (vm.c.cardlist.length <= 0) {
                    abp.notify.warn("请选择卡券");
                    return;
                }
                vm.plan.cardList = vm.c.cardlist;
                if (vm.o.coll.length <= 0) {
                    abp.notify.warn("请选择组织");
                    return;
                }
                vm.plan.machineList = vm.o.coll;
                if (vm.t.select.length <= 0) {
                    abp.notify.warn("请选择提示信息");
                    return;
                }
                vm.plan.tipsList = vm.t.select;
                var url = "api/plan/updatePlan";
                dataFactory.action(url, "", null, vm.plan).then(function (res) {
                    if (res.result == "1") {
                        abp.notify.success("成功");
                        $state.go("plan");
                    } else {
                        abp.notify.error(res.errorMsg);
                    }
                })
            }

        }]);
})();

