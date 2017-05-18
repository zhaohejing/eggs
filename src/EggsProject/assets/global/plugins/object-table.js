/**
 * object-table - angular smart table directive
 * @version v0.2.1
 * @author Yauheni Kokatau
 * @license MIT
 */
"use strict";
angular.module("objectTable", []).directive("contenteditable",
    function () {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (e, t, r, n) {
                function a()
                { n.$setViewValue(t.html()) }
                n.$render = function ()
                { t.html(n.$viewValue || "") },
                t.bind("change blur",
                    function () { e.$apply(a) })
            }
        }
    }),

angular.module("objectTable").directive("objectTable",
    ["$compile", "$interpolate",
        function (e, t) {
            return {
                restrict: "A",
                replace: !0,
                templateUrl: "/src/templates/common.html",
                controller: "objectTableCtrl",
                controllerAs: "ctrl", transclude: !0,
                scope: {
                    data: "=",
                    checkModel: "=?",
                    display: "=?",
                    backModel: "=?",
                    resize: "=?",
                    paging: "=?",
                    fromUrl: "@",
                    sortingType: "@?sorting",
                    editable: "=?",
                    select: "@?",
                    selectedModel: "=?",
                    dragColumns: "=?"
                },
                compile:
                    function (e, t) {
                        var r = "",
                            n = "";
                        return t.addFilter && (r += t.addFilter),

                            "false" !== t.sorting && (r += "| orderBy:sortingArray"),

                            t.dragColumns && e.find("th").attr("allow-drag", ""),

                            "separate" == t.search ?
                            t.fields.split(",").forEach(function (e, t) {
                                r += "| filter:{'" + e.trim() + "':columnSearch['" + e + "']}"
                            }) : ("undefined" == typeof t.search || "true" == t.search) && (r += "| filter:globalSearch"),

                            n += " | offset: currentPage:display |limitTo: display",

                            e[0].querySelector("#rowTr").setAttribute("ng-repeat", "item in $parent.$filtered = (data" + r + ")" + n),
                            e.find("paging").attr("count", "$filtered.length"),

                            function (e, t, a, o, i) {
                                o._init();
                               i(e, function (t, a) {

                                    e.$owner = a.$parent; for (var i in t)
                                        if (t.hasOwnProperty(i))
                                            switch (t[i].tagName) {
                                   case "THEAD": o._addHeaderPattern(t[i]); break;
                                                case "TBODY": e.findBody = !0, o._addRowPattern(t[i], r, n); break;
                                                case "TFOOT": o._addFooterPattern(t[i])
                                            }
                                })
                            }
                    }
            }
        }]),

angular.module("objectTable").directive("allowDrag",
    function () {
        return {
            restrict: "A", controller: function () { },
            compile: function (e, t) {
                function r(e, t) {
                   var r = e[0].parentNode.querySelector("." + t);
                    r && r.classList.remove(t)
                } return function (e, t, n, a) {
                    t.attr("draggable", !0),
                        t.bind("dragstart", function (e) {
                            a.target = this,
                                this.classList.add("dragged"), e.dataTransfer.setData("text", a.target.cellIndex)
                        }), t.bind("dragover", function (e) { e.preventDefault() }),
                    t.bind("dragenter", function (e) {
                        a.toTarget = this,
                            this.classList.contains("draggedOver") || this.classList.contains("dragged") || this.classList.add("draggedOver"), e.preventDefault(), e.stopPropagation()
                    }), t.bind("dragend", function (e) {
                        this.classList.contains("dragged") && this.classList.remove("dragged"),
                          e.preventDefault()
                    }), t.bind("dragleave", function (e) { this.classList.remove("draggedOver") }),
                    t.bind("drop", function (e) {
                        var n = a.toTarget.cellIndex, o = parseInt(e.dataTransfer.getData("text"), 10);
                        r(t, "dragged"), r(t, "draggedOver"),
                        t.parent().controller("objectTable").changeColumnsOrder(n, o),
                        e.preventDefault()
                    })
                }
            }
        }
    }),

angular.module("objectTable").controller("objectTableCtrl",
    ["$scope", "$timeout", "$element", "$attrs", "$http", "$compile", "$controller", "objectTableUtilService", "$filter",
        function (e, t, r, n, a, o, i, l, f) {
            i("objectTableSortingCtrl",
                { $scope: e });
            
            var s = this;
            this._init = function () {

                //检测window高度变化
                //window.onresize = function () {
                //    e.display = (e.display>15 && e.display) ||(angular.element(window).height() >= 900 && 15) || (angular.element(window).height() >= 700 && 10) || 5;
                //    e.$apply();
                //}

                e.headers = [], e.fields = [], e.display = e.display || 5,
                  e.paging = angular.isDefined(e.paging) ? e.paging : !0,

                e.sortingType = e.sortingType || "simple", e.currentPage = 0,
                e.customHeader = !1, "separate" == n.search ? (e.search = "separate",
                e.columnSearch = []) : e.search = "undefined" == typeof n.search || "true" === n.search,
                e.headers = l.getArrayFromParams(n.headers, "headers"),
                e.fields = l.getArrayFromParams(n.fields, "fields"),
                n.fromUrl && this._loadExternalData(n.fromUrl),
                e.selectedModel = "multiply" === e.select ? [] : {}
            },

            this._loadExternalData = function (t) {
                e.dataIsLoading = !0,
                a.get(t).then(function (t) {
                    e.data = t.data, e.dataIsLoading = !1
                })
            },
            this._addHeaderPattern = function (t) {
                e.customHeader = !0, Array.prototype.forEach.call(t.querySelectorAll("[allow-drag]"), function (e, t) {
                    e.setAttribute("index", t)
                }), t.removeAttribute("ng-non-bindable"), r.find("table").prepend(t)
            },
            this._addFooterPattern = function (e) {
                r.find("table").prepend(e)
            },
            this._addRowPattern = function (t, n, a) {
                this._checkEditableContent(t), this._addRepeatToRow(t, n, a), t.removeAttribute("ng-non-bindable"),
                r.find("table").append(t.outerHTML), this.bodyTemplate = t.innerHTML, o(r.find("tbody"))(e)
            },

            this._addRepeatToRow = function (e, t, r) {

                var n = angular.element(e).find("tr"); n.attr("ng-repeat",
                    "item in $filtered = (data" + t + ")" + r), n.attr("ng-click") || n.attr("ng-click", "setSelected(item)"),
                n.attr("ng-class", "{'selected-row':(ifSelected(item)||item.checked)}")
            },

            this._checkEditableContent = function (e) {
                var t, r = /\{\{:*:*(.*?)\}\}/g;
                Array.prototype.forEach.call(e.querySelectorAll("[editable]"),
                    function (e) {
                        t = e.innerHTML.replace(r, "$1"), e.innerHTML = "<div contentEditable ng-model='" + t + "'>{{" + t + "}}</div>"
                    })
            },
            this.setCurrentPage = function (t) {
                e.currentPage = t
            },

            e.setSelected = function (t) {
                "multiply" === e.select ?
                s._containsInSelectArray(t)
                ? e.selectedModel.splice(e.selectedModel.indexOf(t), 1)
                :
                e.selectedModel.push(t) :
                e.selectedModel = t
            },

            this._containsInSelectArray = function (t) {
                return e.selectedModel.length ? e.selectedModel.filter(function (e) {
                    return angular.equals(e, t)
                }).length > 0 : void 0
            },

            e.ifSelected = function (t) {
                return e.selectedModel && "multiply" === e.select ? s._containsInSelectArray(t) :
                    t.$$hashKey == e.selectedModel.$$hashKey
            },

            this.changeColumnsOrder = function (t, n) {
                e.$apply(function () {
                    if (e.fields.swap(t, n), e.headers.swap(t, n), e.columnSearch && e.columnSearch.swap(t, n), s.bodyTemplate) {
                        var a = angular.element(s.bodyTemplate).children(), i = document.createElement("tr"),
                            l = document.createElement("tbody"), c = r.find("tbody").find("tr")[0].attributes;
                        Array.prototype.swap.apply(a, [t, n]), [].forEach.call(c, function (e, t) {
                            i.setAttribute(e.name, e.value)
                        }); for (var d = 0, u = a.length; u > d; d++) i.appendChild(a[d]); l.appendChild(i),
                        r.find("tbody").replaceWith(l), s.bodyTemplate = l.innerHTML, o(r.find("tbody"))(e)
                    } if (e.customHeader) {
                        var g = r.find("th"), i = document.createElement("tr"),
                            p = document.createElement("thead"); Array.prototype.swap.apply(g, [t, n]);
                        for (var d = 0, u = g.length; u > d; d++) i.appendChild(g[d]); p.appendChild(i),
                        r.find("thead").replaceWith(p)
                    } s.pageCtrl && s.pageCtrl.setPage(0)
                })

            },
            e.setCurrentPageForPageCtrl = function (e) {
                s.pageCtrl && s.pageCtrl.setPage(e)
            },
            e.checkAll = function (event) {
                angular.forEach(e.data, function (value, key) {
                    value.checked = event.target.checked;
                    if (value.checked) {
                        e.checkModel[value.id] = value;
                    } else {
                        delete e.checkModel[value.id];
                    }
                });

                e.choseArr = [];
                angular.forEach(
                  f('filter')(e.data, { checked: true }), function (v) {
                      e.choseArr.push(v.text);
                  });

                if (e.choseArr.length > 0)
                {
                    $('tbody tr').css({ color: "#4d90fe", fontSize: 12, backgroundColor: "#f6fafd" });

                } else {
                    $('tbody tr').css({ color: "#4e5b80", fontSize: 12, backgroundColor: "#ffffff" });
                }
            },
            e.checkOne = function (item) {
                var index = 0;
                for (var i = 0 ; i < e.data.length ; i++){
                    if(item == e.data[i]){
                        index = i;
                        break;
                    }
                }

                if (item.checked) {
                    e.checkModel[item.id] = item;
                    $('tbody tr').eq(index).css({ color: "#4d90fe", fontSize: 12, backgroundColor: "#f6fafd" });
                } else {
                    delete e.checkModel[item.id];
                    $('tbody tr').eq(index).css({ color: "#4e5b80", fontSize: 12, backgroundColor: "#ffffff" });
                }
                e.choseArr = [];
                angular.forEach(
                  f('filter')(e.data, { checked: true }), function (v) {
                      e.choseArr.push(v.text);
                  });
                var ele = document.querySelector("#checkAllBox");
                ele.checked = e.choseArr.length == e.data.length;

                //if (e.backModel['back']) {
                //    e.backModel['back'](Object.getOwnPropertyNames(e.checkModel).length);
                //}
                
            };
            e.$watch('data', function (nv, ov) {
                if (nv == ov) {
                    return;
                }
                e.choseArr = [];
                angular.forEach(
                  f('filter')(nv, { checked: true }), function (v) {
                      e.choseArr.push(v.text);
                  });

                var ele = document.querySelector("#checkAllBox");
                if (ele) ele.checked = (e.choseArr.length == e.data.length && e.choseArr.length>0);

            }, true);
        }]),



angular.module("objectTable").filter("offset",
    function () {
        return function (e, t, r) {
            if (e) {
                t = parseInt(t, 10), r = parseInt(r, 10); var n = t * r; return e.slice(n, n + r)
            }
        }
    }),

angular.module("objectTable").controller("pagingTableCtrl",
    ["$scope", "$element", "$attrs",
        function (e, t, r) {
        e.currentPage = 0, e.prevPage = function () {
            e.currentPage > 0 && e.currentPage--, e.setCurrentPageToTable()
        }, e.nextPage = function () {
            e.currentPage < e.pageCount()
                && e.currentPage++, e.setCurrentPageToTable()
        }, e.setCurrentPageToTable = function () {
            e.objectTableCtrl.setCurrentPage(e.currentPage)
        }, e.prevPageDisabled = function () {
            return 0 === e.currentPage ?
                "disabled" : ""
        }, e.pageCount = function () {
            return e.count > 0 ? Math.ceil(e.count / e.display) - 1 : 0
        },
        e.nextPageDisabled = function () {
            return e.currentPage === e.pageCount() ? "disabled" : ""
        }, e.setPage = function (t) { e.currentPage = t, e.setCurrentPageToTable() }, e.range = function () {
            var t = e.pageCount() + 1 < 5 ? e.pageCount() + 1 : 5, r = [], n = e.currentPage; n > e.pageCount() - t && (n = e.pageCount() - t + 1); for (var a = n; n + t > a; a++) r.push(a); return r
        }
        }]),

angular.module("objectTable").controller("objectTableSortingCtrl", ["$scope",
        function (e) {
        function t(e) { o && (r.width = a + (e.pageX - n)) } e.sort = { fields: [], reverse: [] }, e.sortingArray = [],
        e.sortBy = function (t) {
            if (i) return void (i = !1); if (e.data.length) {
                var r = e.headers[e.fields.indexOf(t)];
                "compound" == e.sortingType ? -1 == e.sort.fields.indexOf(r) ?
                (e.sort.fields.push(r), e.sortingArray.push(t), e.sort.reverse.push(!1)) :
                e.changeReversing(t, e.sort.fields.indexOf(r)) :
                "simple" == e.sortingType && (e.sort.fields = [r], e.changeReversing(t))
            }
        }, e.changeReversing = function (t, r) {
            "compound" == e.sortingType ? (e.sort.reverse[r] = !e.sort.reverse[r], e.sortingArray[r] = e.sort.reverse[r] ? "-" + t : t) : "simple" == e.sortingType && (e.sort.reverse[0] = !e.sort.reverse[0], e.sortingArray = e.sort.reverse[0] ? [t] : ["-" + t])
        }, e.headerIsSortedClass = function (t) {
            if (e.sortingArray.length) if ("simple" == e.sortingType) {
                if (t == e.sort.fields[0] || "-" + t == e.sort.fields[0])
                    return e.sort.reverse[0] ? "table-sort-down" : "table-sort-up"
            } else if ("compound" == e.sortingType) {
                var r = e.sort.fields.indexOf(t);
                if (-1 != r) return e.sort.reverse[r] ? "table-sort-down" : "table-sort-up"
            }
        }, e.removeSorting = function () {
            var t = e.sort.fields.indexOf(this.sortField);
            t > -1 && (e.sort.fields.splice(t, 1), e.sort.reverse.splice(t, 1), e.sortingArray.splice(t, 1)), t = null
        }; var r, n, a, o = !1, i = !1; e.resizeStart = function (e) {
            var i = e.target ? e.target : e.srcElement; i.classList.contains("resize") && (r = i.parentNode, o = !0,
            n = e.pageX, a = i.parentNode.offsetWidth, document.addEventListener("mousemove", t),
            e.stopPropagation(), e.preventDefault())
        }, e.resizeEnd = function (e) {
            o && (document.removeEventListener("mousemove", t),
                e.stopPropagation(), e.preventDefault(), o = !1, i = !0)
        }
        }]),
angular.module("objectTable").service("objectTableUtilService",[function () {

        return Array.prototype.swap = function (e, t) {
            if (e >= this.length) for (var r = e - this.length; r-- + 1;)
                this.push(void 0); return this.splice(e, 0, this.splice(t, 1)[0]), this
        }, {
            getArrayFromParams: function (e, t) {
                if (!e) throw "Required '" + t + "' attribute is not found!";
                for (var r = [], n = e.split(","), a = 0, o = n.length; o > a; a++) r.push(n[a].trim()); return r
            }
        }
}]),
//长度过滤
angular.module("objectTable").directive("showTd", ["$filter", function ($filter) {
    return {
        restrict: 'EA',
        template: '<td><span title="{{showName}}">{{name}}</span></td>',
        scope: { item: "=" },
        replace: true,
        link: function (scope, element, attrs) {

            if (!scope.item) return;

            var maxLen = attrs['maxlen'] ? attrs['maxlen'] : 20;

            scope.format = attrs['format'] ? (attrs['format']) : null;

            if (attrs['name'].indexOf(".") != -1) {
                var arr = attrs['name'].split(".");
                var temp = scope.item;
                for (var i = 0 ; i < arr.length ; i++) {
                    temp = temp[arr[i]];
                }
                scope.showName = temp;
            } else {
                scope.showName = scope.item[attrs['name']];
            }

            if (scope.showName == null||scope.showName==undefined) return;

            var strLen = scope.showName.length;

            //如果需要可视化成时间
            if (scope.format) {
                scope.name = $filter('date')(scope.showName, scope.format);
                scope.showName = scope.name;
            } else {
                scope.name = (strLen > maxLen && scope.showName.substring(0, maxLen) + '...') || (scope.showName)
            }
        }
    };
}]
);



//angular.module("objectTable").directive("paging",
//    ["$compile", "$interpolate", function (e, t) {
//    return {
//        restrict: "E",
//        replace: !0,
//        templateUrl: "/src/templates/paging.html",
//        controller: "pagingTableCtrl",
//        require: "^objectTable",
//        scope: { count: "=", display: "=" },
//        link: function (e, t, r, n) {
//            e.objectTableCtrl = n, e.objectTableCtrl.pageCtrl = e
//        }
//    }
//    }]);

/**
 * Angularjs环境下分页
 * name: tm.pagination
 * Version: 1.0.0
 */
angular.module('objPagination', []).directive('objPagination', [function () {
    return {
        restrict: 'EA',
        template: '<div class="page-list">' +
            '<ul class="pagination" ng-show="conf.totalItems > 0">' +
            '<li ng-class="{disabled: conf.currentPage == 1}" ng-click="prevPage()"><span>&laquo;</span></li>' +
            '<li ng-repeat="item in pageList track by $index" ng-class="{active: item == conf.currentPage, separate: item == \'...\'}" ' +
            'ng-click="changeCurrentPage(item)">' +
            '<span>{{ item }}</span>' +
            '</li>' +
            '<li ng-class="{disabled: conf.currentPage == conf.numberOfPages}" ng-click="nextPage()"><span>&raquo;</span></li>' +
            '</ul>' +
            '<div class="page-total" ng-show="conf.totalItems > 0">' +
            '第<input type="text" ng-model="jumpPageNum"  ng-keyup="jumpToPage($event)"/>页 ' +
            '每页<select ng-model="conf.itemsPerPage" ng-options="option for option in conf.perPageOptions " ng-change="changeItemsPerPage()"></select>' +
            '/共<strong>{{ conf.totalItems }}</strong>条' +
            '</div>' +
            '<div class="no-items" ng-show="conf.totalItems <= 0">暂无数据</div>' +
            '</div>',
        replace: true,
        scope: {
            conf: '='
        },
        link: function (scope, element, attrs) {
            // 变更当前页
            scope.changeCurrentPage = function (item) {
                if (item == '...') {
                    return;
                } else {
                    scope.conf.currentPage = item;
                }
            };

            // 定义分页的长度必须为奇数 (default:9)
                scope.conf.pagesLength = parseInt(scope.conf.pagesLength) ? parseInt(scope.conf.pagesLength) : 9;
            if (scope.conf.pagesLength % 2 === 0) {
                // 如果不是奇数的时候处理一下
                scope.conf.pagesLength = scope.conf.pagesLength - 1;
            }

            // conf.erPageOptions
            if (!scope.conf.perPageOptions) {
                scope.conf.perPageOptions = [5,10,15,20,50];
            }

            // pageList数组
            function getPagination(nv, ov) {
                

                // conf.currentPage
                scope.conf.currentPage = parseInt(scope.conf.currentPage) ? parseInt(scope.conf.currentPage) : 1;
                // conf.totalItems
                scope.conf.totalItems = parseInt(scope.conf.totalItems);

                // conf.itemsPerPage (default:15)
                // 先判断一下本地存储中有没有这个值
                if (scope.conf.rememberPerPage) {
                    if (!parseInt(localStorage[scope.conf.rememberPerPage])) {
                        localStorage[scope.conf.rememberPerPage] = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 15;
                    }

                    scope.conf.itemsPerPage = parseInt(localStorage[scope.conf.rememberPerPage]);


                } else {
                    scope.conf.itemsPerPage = parseInt(scope.conf.itemsPerPage) ? parseInt(scope.conf.itemsPerPage) : 15;
                }

                // numberOfPages
                scope.conf.numberOfPages = Math.ceil(scope.conf.totalItems / scope.conf.itemsPerPage);

                // judge currentPage > scope.numberOfPages
                if (scope.conf.currentPage < 1) {
                    scope.conf.currentPage = 1;
                }

                if (scope.conf.currentPage > scope.conf.numberOfPages) {
                    scope.conf.currentPage = scope.conf.numberOfPages;
                }

                // jumpPageNum
                scope.jumpPageNum = scope.conf.currentPage;

                // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                var perPageOptionsLength = scope.conf.perPageOptions.length;
                // 定义状态
                var perPageOptionsStatus;
                for (var i = 0; i < perPageOptionsLength; i++) {
                    if (scope.conf.perPageOptions[i] == scope.conf.itemsPerPage) {
                        perPageOptionsStatus = true;
                    }
                }
                // 如果itemsPerPage在不在perPageOptions数组中，就把itemsPerPage加入这个数组中
                if (!perPageOptionsStatus) {
                    scope.conf.perPageOptions.push(scope.conf.itemsPerPage);
                }

                // 对选项进行sort
                scope.conf.perPageOptions.sort(function (a, b) { return a - b });

                scope.pageList = [];
                if (scope.conf.numberOfPages <= scope.conf.pagesLength) {
                    // 判断总页数如果小于等于分页的长度，若小于则直接显示
                    for (i = 1; i <= scope.conf.numberOfPages; i++) {
                        scope.pageList.push(i);
                    }
                } else {
                    // 总页数大于分页长度（此时分为三种情况：1.左边没有...2.右边没有...3.左右都有...）
                    // 计算中心偏移量
                    var offset = (scope.conf.pagesLength - 1) / 2;
                    if (scope.conf.currentPage <= offset) {
                        // 左边没有...
                        for (i = 1; i <= offset + 1; i++) {
                            scope.pageList.push(i);
                        }
                        scope.pageList.push('...');
                        scope.pageList.push(scope.conf.numberOfPages);
                    } else if (scope.conf.currentPage > scope.conf.numberOfPages - offset) {
                        scope.pageList.push(1);
                        scope.pageList.push('...');
                        for (i = offset + 1; i >= 1; i--) {
                            scope.pageList.push(scope.conf.numberOfPages - i);
                        }
                        scope.pageList.push(scope.conf.numberOfPages);
                    } else {
                        // 最后一种情况，两边都有...
                        scope.pageList.push(1);
                        scope.pageList.push('...');

                        for (i = Math.ceil(offset / 2) ; i >= 1; i--) {
                            scope.pageList.push(scope.conf.currentPage - i);
                        }
                        scope.pageList.push(scope.conf.currentPage);
                        for (i = 1; i <= offset / 2; i++) {
                            scope.pageList.push(scope.conf.currentPage + i);
                        }

                        scope.pageList.push('...');
                        scope.pageList.push(scope.conf.numberOfPages);
                    }
                }

                if (ov.indexOf('1 0 ') !=-1) { return; }

                if (scope.conf.onChange && scope.conf.currentPage>=1) {
                    scope.conf.onChange();
                }
                scope.$parent.conf = scope.conf;
            }

            // prevPage
            scope.prevPage = function () {
                if (scope.conf.currentPage > 1) {
                    scope.conf.currentPage -= 1;
                }
            };
            // nextPage
            scope.nextPage = function () {
                if (scope.conf.currentPage < scope.conf.numberOfPages) {
                    scope.conf.currentPage += 1;
                }
            };

            // 跳转页
            scope.jumpToPage = function () {
                scope.jumpPageNum = scope.jumpPageNum.replace(/[^0-9]/g, '');
                if (scope.jumpPageNum !== '') {
                    scope.conf.currentPage = scope.jumpPageNum;
                }
            };

            // 修改每页显示的条数
            scope.changeItemsPerPage = function () {
                // 清除本地存储的值方便重新设置
                if (scope.conf.rememberPerPage) {
                    localStorage.removeItem(scope.conf.rememberPerPage);
                }
            };

            scope.$watch(function () {
                if (scope.conf.currentPage<=0) {
                    scope.conf.currentPage = 1;
                }
                var newValue = scope.conf.currentPage + ' ' + scope.conf.totalItems + ' ';
                // 如果直接watch perPage变化的时候，因为记住功能的原因，所以一开始可能调用两次。
                //所以用了如下方式处理
                if (scope.conf.rememberPerPage) {
                    // 由于记住的时候需要特别处理一下，不然可能造成反复请求
                    // 之所以不监控localStorage[scope.conf.rememberPerPage]是因为在删除的时候会undefind
                    // 然后又一次请求
                    if (localStorage[scope.conf.rememberPerPage]) {
                        newValue += localStorage[scope.conf.rememberPerPage];
                    } else {
                        newValue += scope.conf.itemsPerPage;
                    }
                } else {
                    newValue += scope.conf.itemsPerPage;
                }
                return newValue;

            }, getPagination);

        }
    };
}]);

///滚动加载
//angular.module('whenScrolled', []).directive('whenScrolled', function () {
//    return function (scope, elm, attr) {
//        var raw = elm[0];
//        elm.bind('scroll', function () {
//            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
//                scope.$apply(attr.whenScrolled);
//            }
//        });
//    };
//});

angular.module("objectTable").run(["$templateCache", function ($templateCache) {
    $templateCache.put("/src/templates/common.html",
        "<div class=\"object-table-module\"><div class=\"clearfix\"></div><div class=\"back-cover\"><table class=\"table table-responsive table-bordered object-table\"><thead ng-if=\"!customHeader\"><tr><th><input type=\"checkbox\" id=\"checkAllBox\" ng-click=\"checkAll($event)\"  class=\"group-checkable\"></th><th ng-repeat=\"head in headers track by $index\"  ng-class=\"headerIsSortedClass(head)\" class=\"sortable\">{{head}}<div ng-if=\"resize\" class=\"resize\"></div></th></tr></thead><thead ng-if=\"!customHeader&& \'separate\'===search\"><tr><th ng-repeat=\"head in headers track by $index\" class=\"separate\"><i class=\"glyphicon glyphicon-search search_icon separate\"></i> <input type=\"text\" ng-model=\"columnSearch[fields[$index]]\" placeholder=\"{{head}}...\" class=\"form-control search separate\" ng-model-options=\"{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }\" ng-change=\"setCurrentPageForPageCtrl(0)\"></th></tr></thead><tbody ng-if=\"!findBody\"><tr id=\"rowTr\" ng-click=\"setSelected(item)\" ng-class=\"{\'selected-row\':(ifSelected(item)||item.checked)}\"><!-- <= will inject ng-repeat --><!-- params: headers and fields --><td><input type=\"checkbox\"  ng-model=\"item.checked\" ng-click=\"checkOne(item,vm.callback)\" class=\"group-checkable\" ></td><td ng-if=\"!editable\" ng-repeat=\"field in fields\">{{item[field]}}</td><td ng-if=\"editable\" editable ng-repeat=\"field in fields\"><div contenteditable ng-model=\"item[field]\">{{item[field]}}</div></td></tr></tbody></table></div><div class=\"loading\" ng-show=\"dataIsLoading\"><span class=\"glyphicon glyphicon-refresh glyphicon-refresh-animate\"></span> Loading Data...</div><div class=\"clearfix\"></div></div>");
}]);
