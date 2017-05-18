(function () {
    angular.module('MetronicApp').controller('views.cycle.index',
        ['$scope', 'settings', "$stateParams", '$state', 'dataFactory', '$uibModal',
        function ($scope, settings, $stateParams, $state, dataFactory, $uibModal) {
            // ajax初始化
            $scope.$on('$viewContentLoaded', function () {
                App.initAjax();
            });
            var vm = this;
         
            vm.filter = {};
            //页面属性
            vm.table = {
                data: [],               //数据集
                checkModel: {},         //选择的集合
                filter: "",//条件搜索
                pageConfig: {           //分页配置
                    currentPage: 1,//当前页
                    itemsPerPage: 10,//页容量
                    totalItems: 0//总数据
                }
            }
            vm.count = { settingTotal: 0, alreadyCount: 0 };

            vm.daily = function (type) {
                var ids = Object.getOwnPropertyNames(vm.table.checkModel);
                if (ids.length <= 0) {
                    abp.notify.warn("请选择要编辑的对象");
                    return;
                }
                var modal = $uibModal.open({
                    templateUrl: 'views/cycle/modal.html',
                    controller: 'views.cycle.modal as vm',
                    //  backdrop: 'static',
                    size: 'sm',//模态框的大小尺寸
                    resolve: {
                        model: function () { return { list: ids, periodType: type } },
                    }
                });
                modal.result.then(function (response) {
                    vm.init();
                })
            }
            vm.export = function () {
                abp.notify.success("导出成功");
            }

            ///机构树
            vm.organizationTree = {
                $tree: null,
                unitCount: 0,
                treeList: [],
                setUnitCount: function (unitCount) {
                    $scope.safeApply(function () {
                        vm.organizationTree.unitCount = unitCount;
                    });
                },
                refreshUnitCount: function () {
                    vm.organizationTree.setUnitCount(vm.organizationTree.$tree.jstree('get_json').length);
                },
                selectedOu: {
                    id: null,
                    displayName: null,
                    code: null,
                    set: function (ouInTree) {
                        if (!ouInTree) {
                            vm.organizationTree.selectedOu.id = null;
                            vm.organizationTree.selectedOu.displayName = null;
                            vm.organizationTree.selectedOu.code = null;
                            vm.organizationTree.selectedOu.type = 1;
                        } else {

                            vm.organizationTree.selectedOu.id = ouInTree.id;
                            vm.organizationTree.selectedOu.displayName = ouInTree.original.displayName;
                            vm.organizationTree.selectedOu.code = ouInTree.original.code;
                            vm.organizationTree.selectedOu.type = ouInTree.original.type;
                            vm.organizationTree.genderTreeNode(ouInTree);
                        }
                        if (vm.organizationTree.selectedOu.id == null) {
                            return;
                        }
                        vm.init();
                        $("a.list-group-item:first-child").css("background-color", "transparent");
                    }
                },
                genderTreeNode: function (ouInTree) {
                    vm.selectList = [];
                    if (vm.organizationTree.treeList.length == 0) {
                        return;
                    }
                    angular.forEach(ouInTree.parents, function (aa, bb) {
                        angular.forEach(vm.organizationTree.treeList, function (a, b) {
                            if (aa == "#") {
                                aa = 0;
                            }
                            if (a.id == Number(aa)) {
                                vm.selectList.push({ order: aa, name: a.name });
                            }
                        });


                    });
                    vm.selectList.push({ order: 9999, name: ouInTree.original.displayName });

                    vm.selectList = vm.selectList.sort(function (a, b) { return a.order - b.order });
                },

                generateTextOnTree: function (ou) {
                    var displayName = ou.name;
                    displayName = displayName.length > 10 ? (displayName.substring(0, 10) + "...") : displayName;
                    var itemClass = ' ou-text-no-members';
                    return '<span  class="ou-text' + itemClass + '" data-ou-id="' + ou.id + '">' + displayName + '</span>';
                },
                incrementMemberCount: function (ouId, incrementAmount) {
                    var treeNode = vm.organizationTree.$tree.jstree('get_node', ouId);
                    treeNode.original.memberCount = treeNode.original.memberCount + incrementAmount;
                    vm.organizationTree.$tree.jstree('rename_node',
                        treeNode,
                        vm.organizationTree.generateTextOnTree(treeNode.original));
                },
                getTreeDataFromServer: function (callback, type) {
                    var list = [];
                    dataFactory.action("api/efan/getOrgList?orgId=1", "", null, {}).then(function (res) {
                        list = res.respBody;
                        list.push({ id: 1, name: "易饭科技", parent_id: 0 });
                        vm.organizationTree.treeList = list;
                        var treeData = _.map(list, function (item) {
                            return {
                                id: item.id,
                                parent: item.parent_id ? item.parent_id : '#',
                                displayName: item.name,
                                text: vm.organizationTree.generateTextOnTree(item),
                                state: {
                                    opened: item.parent_id <= 0 ? true : false
                                }
                            };
                        });

                        callback(treeData);
                    });
                    //var list = [
                    //    { id: 1, parentId: 0, displayName: "A机构" },
                    //    { id: 2, parentId: 1, displayName: "A子机构" },
                    //    { id: 3, parentId: 0, displayName: "B机构" },
                    //    { id: 4, parentId: 3, displayName: "B子机构" },
                    //];



                },
                init: function (type) {
                    vm.organizationTree.getTreeDataFromServer(function (treeData) {
                        vm.organizationTree.setUnitCount(treeData.length);
                        vm.organizationTree.$tree = $('#OrganizationUnitEditTree');
                        var jsTreePlugins = [
                            'types',
                          //  'contextmenu',
                            'wholerow',
                            'sort'
                        ];

                        vm.organizationTree.$tree
                            .on('changed.jstree', function (e, data) {
                                $scope.safeApply(function () {
                                    if (data.selected.length != 1) {
                                        vm.organizationTree.selectedOu.set(null);
                                    } else {
                                        var selectedNode = data.instance.get_node(data.selected[0]);
                                        vm.organizationTree.selectedOu.set(selectedNode);
                                    }
                                });

                            })
                            .on('move_node.jstree', function (e, data) {

                                if (!vm.permissions.manageOrganizationTree) {
                                    vm.organizationTree.$tree.jstree('refresh'); //rollback
                                    return;
                                }

                                var parentNodeName = (!data.parent || data.parent == '#')
                                    ? app.localize('Root')
                                    : vm.organizationTree.$tree.jstree('get_node', data.parent).original.displayName;

                                abp.message.confirm(
                                    app.localize('OrganizationUnitMoveConfirmMessage', data.node.original.displayName, parentNodeName),
                                    function (isConfirmed) {
                                        if (isConfirmed) {
                                            organizationUnitService.moveOrganizationUnit({
                                                id: data.node.id,
                                                newParentId: data.parent
                                            }).success(function () {
                                                abp.notify.success('机构调整成功');
                                                vm.organizationTree.reload();
                                            }).catch(function (err) {
                                                vm.organizationTree.$tree.jstree('refresh'); //rollback
                                                setTimeout(function () { abp.message.error(err.data.message); }, 500);
                                            });
                                        } else {
                                            vm.organizationTree.$tree.jstree('refresh'); //rollback
                                        }
                                    }
                                );
                            })

                            .jstree({
                                'core': {
                                    data: treeData,
                                    multiple: false,
                                    check_callback: function (operation, node, node_parent, node_position, more) {
                                        return true;
                                    }
                                },
                                types: {
                                    "default": {
                                        "icon": "fa"
                                    },
                                    "file": {
                                        "icon": "fa"
                                    }
                                },
                                contextmenu: {
                                    items: vm.organizationTree.contextMenu
                                },
                                sort: function (node1, node2) {
                                    var left = this.get_node(node2).original.displayName;
                                    var right = this.get_node(node1).original.displayName;
                                    if (!left.localeCompare(right)) {
                                        return 1;
                                    }
                                    return -1;
                                },
                                plugins: jsTreePlugins
                            });

                        vm.organizationTree.$tree.on('click', '.ou-text .fa-caret-down', function (e) {
                            e.preventDefault();

                            var ouId = $(this).closest('.ou-text').attr('data-ou-id');
                            setTimeout(function () {
                                vm.organizationTree.$tree.jstree('show_contextmenu', ouId);
                            }, 100);
                        });
                    }, type);
                },
                reload: function () {
                    vm.organizationTree.getTreeDataFromServer(function (treeData) {
                        vm.organizationTree.setUnitCount(treeData.length);
                        vm.organizationTree.$tree.jstree(true).settings.core.data = treeData;
                        vm.organizationTree.$tree.jstree('refresh');
                    }, 1);
                }
            };

            vm.init = function () {
                vm.table.checkModel = {};
                vm.filter.pageNum = vm.table.pageConfig.currentPage;
                vm.filter.pageSize = vm.table.pageConfig.itemsPerPage;
                vm.filter.orgId = vm.organizationTree.selectedOu.id;
                if (vm.filter.check) {
                    vm.filter.isSetting = 1;
                } else if (vm.filter.uncheck) {
                    vm.filter.isSetting = 0;
                } else {
                    vm.filter.isSetting = null;
                }

                dataFactory.action("api/orgsetting/selectOrgPeriodSetting", "", null, vm.filter)
                    .then(function (res) {
                        if (res.result == "1") {
                            vm.table.pageConfig.totalItems = res.total;
                            vm.table.data = res.list;
                            vm.count.settingTotal = res.settingTotal;
                            vm.count.alreadyCount = res.alreadyCount;
                            vm.table.pageConfig.onChange = function () {
                                vm.init();
                            }
                        }
                    });
            };
            vm.organizationTree.init();
        }])
})();