(function ($) {
    var dataType = {
        image: 'IMAGE',
        html: 'HTML',
        text: 'TEXT',
        checkbox: 'CHECKBOX',
        radio: 'RADIO'
    }
    var inputType = {
        text: 'TEXT',
        checkbox: 'CHECKBOX',
        radio: 'RADIO',
        select: 'SELECT',
        search: 'SEARCH',
        date: "DATE",
        searchBtn: 'searchBtn',
        rowEnd: 'rowEnd'
    };
    var isNull = function (value) {
        return value === undefined || value === null || value === '';
    }
    var TableHelper = (function () {
        var TableHelper = function (parent, columns, options) {
            this.$parent = $(parent);

            options = options || {};
            //options.tableClass && (options.tableClass);
            this.init(options);
            //var renderTable = this.opts.renderTable||this.createTable
            if(this.opts.renderTable){
                //this.$parent.append(this.renderTable())
                var self = this,div = $('<div>');
                this.$parent.append(div);
                this.renderTableData = function(data){
                    var dom = this.opts.renderTable(data,div);
                    if(dom&&dom!=div){
                        div.append(dom);
                    }
                }
                this.loading =function(){
                    var loading = this.opts.loading
                    loading&&loading();
                }
            }else {
                this.columnsConfig = columns;
                this.initColumns(columns);
                this.$parent.append(this.createTable());
            }
        };
        TableHelper.prototype = {
            init: function (options) {
                this.opts = {};
                this.columns = {};
                this.rows = [];
                this.cols = [];
                this.headers = [];
                this.sortFields = null;
                $.extend(this.opts, this.defaultOpts, options);
                this.opts.noValueFilter = this.opts.noValueFilter || this.getNoValueFilter();
            },
            initColumns: function (columns) {
                var self = this;
                var defaultColOpts = {
                    renderCell: this.opts.cellRender,
                    dataTypes: null
                };
                $.each(columns, function (i, c) {
                    var key = i;
                    self.columns[key] = {};
                    $.extend(self.columns[key], defaultColOpts, c);
                });

            },
            defaultOpts: {
                baseClass: ' table table-bordered table-hover table-condensed ',
                tableClass: ' gridTable',
                NoDataRowText: '没有数据！',
                NullDataText: '-',
                showNoData: true,
                emptyRowClass: 'emptyRow',
                noValues: [null, 'null', 'undefined', undefined],
                filterNullValue: false,
                noValueFilter: null,//自定义过滤空值function
                cellRender: function (value, node, object, valueFilter) {
                    valueFilter && (value = valueFilter(value));
                    return node.text(value);
                },
                imageRender: function (value, node, object) {
                    var data = value;
                    if (typeof value == 'string') {
                        data = {
                            src: value
                        }
                    }
                    var html = '<span class="img_con"><img src="' + data.src + '" ' + (data.alt ? ' alt="' + data.alt + '" ' : '')
                        + (data.cssClass ? ' class="' + data.cssClass + '" ' : '')
                        + (data.style ? ' style="' + data.style + '" ' : '')
                        + ' ></img></span>';
                    node.append(html);
                    return node;
                },
                checkboxRender: function (value, node, object) {
                    var input = $('<input type="checkbox" class="selectone" />'),
                        outer = $('<span class="checkboxwrap"></span>').append(input);
                    isNull(value) || input.attr('checked', value);
                    node.append(outer);
                    return node;

                },
                radioRender: function (value, node, object) {
                    var input = $('<input type="radio" class="selectone" />'),
                        outer = $('<span class="checkboxwrap"></span>').append(input);
                    isNull(value) || input.prop('checked', value);
                    node.append(outer);
                    return node;

                },
                textRender: function (value, node, object, valueFilter) {
                    var outer = $("<span class='desc'></span>");
                    valueFilter && (value = valueFilter(value));
                    outer.text(value);
                    node.append(outer);
                    return node;
                }
            },
            getNoValueFilter: function () {
                var self = this;
                if (!self.opts.filterNullValue)return function (val) {
                    return val;
                };
                var fun = function (value) {
                    var hasNull = false, noValues = self.opts.noValues;
                    for (var i = 0, len = noValues.length; i < len; i++) {
                        if (value === noValues[i]) {
                            hasNull = true;
                            break;
                        }
                    }
                    return hasNull ? self.opts.NullDataText : value;
                }
                return fun;
            },
            createTable: function (data) {
                var $table = this.$table = $("<table class='" + (this.opts.baseClass + this.opts.tableClass) + "'></table>"),
                    $colGroup = this.createColGroup(),
                    $tableHeader = this.createTableHeader(),
                    $tableBody = this.createTableBody();
                $table.append($colGroup).append($tableHeader).append($tableBody);
                this.$table = $table;
                this.$tableHeader = $tableHeader;
                this.$tableBody = $tableBody;
                //$table.on('loadfailure',function(){
                //    alert('数据加载失败')//todo 出错处理
                //});
                return $table;
            },
            renderTableData: function (data) {
                var tbody = this.$tableBody, self = this;
                tbody.empty().focus();
                var renderTableRow = self.opts.renderTableRow||self.createTableRow;
                if (data && data.length) {
                    $.each(data, function (i, d) {
                        var row = renderTableRow.call(self,i, d, tbody);
                        if(row&&row !=tbody){
                            tbody.append(row);
                        }
                    });
                } else {
                    self.opts.showNoData && tbody.append(self.createEmptyRow());
                }
            },
            createColGroup: function () {
                var $colGroup = $('<colGroup>'), self = this;
                $.each(self.columns, function (i, c) {
                    var $col = $('<col>'), col = c.col;
                    $colGroup.append($col);
                    if (col) {
                        var arr = col.split(';');
                        $.each(arr, function (i, v) {
                            var a = v.split(':');
                            if (a.length == 2) {
                                $col.attr.apply($col, a);
                            }
                        })
                    }
                });
                return $colGroup;
            },
            createTableHeader: function (data) {
                var tr = $('<tr></tr>'), self = this;
                $.each(self.columns, function (i, c) {
                    tr.append(self.createHeaderTD(c))
                });
                var thead = $('<thead></thead>');
                thead.append(tr);
                return thead;
            },
            createHeaderTD: function (column) {
                var td = $('<td></td>');
                column.headerClass && td.addClass(column.headerClass);
                if (column.headerStyle) {
                    var style = column.headerStyle,
                        ss = style.split(';'), css = {};
                    $.each(ss, function (i, s) {
                        var arr = s.split(':');
                        css[arr[0]] = arr[1];
                    });
                    td.css(css);
                }
                if (column.sort) {
                    this.createSortHeaderContent(column, td);
                } else {
                    td.html(column.label);//use html to show table header
                }
                var index = this.headers.length;
                this.cols[index] = [];
                this.headers.push(td);

                if (column.afterHeaderRender) {
                    column.afterHeaderRender(td, this.cols[index]);
                }
                return td;
            },
            createSortHeaderContent: function (column, td) {
                if (!this.sortFields) {
                    this.resetSort = this.updateSort;
                    this.sortFields = [];
                }
                var self = this, field = column.field,
                    outer = $('<div class="sorts" />'),
                    up = $('<div class="up" />').click(function () {
                        self.sortHeader(this, field, true);
                    }),
                    down = $('<div class="down" />').click(function () {
                        self.sortHeader(this, field);
                    });
                td.append(outer.append(column.label).append(up).append(down));
            },
            sortHeader: function (node, field, asc) {
                //this.sortFields.push(node);
                this.sortFields[0] = node;
                var data = {sort: field + "-" + (asc ? "asc" : "desc")};
                this.dataHelper.refreshTable(data);
            },
            updateSort: function (clean) {
                this.$tableHeader.find('td div.current').removeClass('current');
                if (clean) {
                    this.sortFields = [];
                } else {
                    $.each(this.sortFields, function (i, n) {
                        $(n).addClass('current');
                    });
                }
            },
            resetSort: function () {
            },
            createTableBody: function () {
                var tbody = $('<tbody></tbody>');
                return tbody;
            },
            createTableRow: function (index, data, tbody) {
                var tr = $('<tr></tr>'), self = this;
                $.each(self.columns, function (i, c) {
                    var cols = self.cols[i], value = data;// data[c.field];
                    tr.append(self.renderTD(i, value, cols));
                });
                tbody.append(tr);
                this.rows.push(tr);
                return tr;
            },
            createEmptyRow: function (text) {
                var self = this, tr = $('<tr></tr>'), tdStr = '<td colspan="' + self.columnsConfig.length + '" class="' + self.opts.emptyRowClass + '">';
                var td = $(tdStr + (text || self.opts.NoDataRowText) + "</td>")
                return tr.append(td);
            },
            renderTD: function (index, data, cols) {
                var td = $('<td></td>'), self = this, column = self.columns[index], field = column.field, value = data[field], node;
                if (column.content) {
                    var type = typeof value;
                    if (isNull(value) || type != 'object') {
                        value = data;
                    }
                    for (var i in column.content) {

                        var d = column.content[i], type = d.type || '', field = d.field, fieldValue = value[field];
                        fieldValue === undefined && (fieldValue = data[field]);
                        var render = d.renderCell || self.opts[type.toLowerCase() + 'Render'] || self.textRender;
                        var filter = type.toLowerCase() == 'text' ? self.opts.noValueFilter : undefined;//add text nullValueFilter, need add other filter
                        node = render.call(self, fieldValue, td, data, filter);
                        if (node && node != td) {
                            td.append(node);
                            node = td;
                        }
                    }
                } else {
                    node = column.renderCell.call(self, value, td, data, self.opts.noValueFilter);
                }
                column.cssClass && td.addClass(column.cssClass);
                if (column.style) {
                    var style = column.style,
                        ss = style.split(';'), css = {};
                    $.each(ss, function (i, s) {
                        var arr = s.split(':');
                        css[arr[0]] = arr[1];
                    });
                    td.css(css);
                }
                if (node && node != td) {
                    td.append(node);
                }
                ;
                column.afterRender && column.afterRender(td, data);
                cols.push(td);
                return td;
            },

            renderData: function (data) {
                //return '<span '+(data.alt?' alt="'+data.alt+'" ':'')
                //    +(data.dataClass?' class="'+data.dataClass+'" ':'')
                //    +(data.style?' style="'+data.style+'" ':'')
                //    +'>'+(data.data||'')+'</span>';
                return '<span class="desc">' + data + '</span>';
            },
            renderHTML: function (data) {
                return data.html || '';
            },
            render: function (data, clean) {
                this.renderTableData(data);
                this.resetSort(clean);
            },
            loading: function () {
                var tbody = this.$tableBody, self = this;
                tbody.empty().focus();
                tbody.append(self.createEmptyRow('加载中。。。'));
            },
            alert:function(res){
                this.dataHelper.alert(res);
            },
            binding: function (dataHelper) {
                this.dataHelper = dataHelper;
            }
        }
        return TableHelper;
    })();
    var PagerHelper = (function () {

        var PagerHelper = function (parent) {
            this.$parent = $(parent);
            //this.dataHelper = dataHelper;

        };
        PagerHelper.prototype = {
            //init: function (options) {
            //    $.extend(this.opts, this.defaultOpts, options);
            //},
            binding: function (dataHelper) {
                this.dataHelper = dataHelper;
                var pageData = dataHelper.pageData;
                this.initData(pageData);
                this.init();
                //this.alert =function(msg){ //todo alert update
                //  alert(msg);
                //}
                this.$parent.append(this.$body);
            },
            alert:function(res){
                this.dataHelper.alert(res);
            },
            initData: function (pageData) {
                var data = {}, self = this;
                pageData = pageData || {};
                $.extend(data, self.defaultOpts, pageData);
                for (var i in data) {
                    var v = data[i];
                    if (typeof v != 'function') {
                        self[i] = v;
                    }
                }
            },
            refresh: function () {
                var self = this;
                var pageData = {
                    pageSize: self.pageSize,
                    pageCurrent: self.pageCurrent
                };
                self.dataHelper.refreshPage(pageData);
            },
            resetPageData: function (pageData) {

                var self = this;
                if (pageData) {
                    self.pageSize = pageData.pageSize;
                    self.pageAll = pageData.pageAll;
                    self.pageCurrent = pageData.pageCurrent;
                    self.allRows = pageData.allRows;
                }
                self.$pageSize.val(self.pageSize);
                self.$pageAll.text(self.pageAll);
                self.$pageCurrent.text(self.pageCurrent);
                self.$allRows.text(self.allRows);
                self.$pageInput.val('');

                $.each([self.$pageHome, self.$pagePrev, self.$pageLast, self.$pageNext], function (i, $n) {
                    $n.removeClass('disabled');
                });
                if (self.pageCurrent == 1)self.disableBtns([self.$pageHome, self.$pagePrev]);
                if (self.pageAll == self.pageCurrent)self.disableBtns([self.$pageLast, self.$pageNext]);
            },
            disableBtns: function (arr) {
                $.each(arr, function (i, $n) {
                    //$n.disable();
                    $n.addClass("disabled");
                });
            },
            buildBody: function () {
                var $body = $('<div class="pages pageRight" style="margin-top:18px;" /> '),
                    $formOuter = $('<form class="form-inline" role="form"/>'),
                    $form = $('<div class="form-group">');
                $body.append($formOuter.append($form));
                this.$body = $body;
                this.$form = $form;
                this.buildPager();
            },
            buildPager: function () {
                var self = this;
                self.$pageSize = $('<select/>')//.addClass('form-control')
                    .append($('<option>', {value: 5, text: 5}))
                    .append($('<option>', {value: 10, text: 10, selected: 'selected'}))
                    .append($('<option>', {value: 15, text: 15}))
                    .append($('<option>', {value: 20, text: 20}))
                    .append($('<option>', {value: 25, text: 25}))
                    .on('change', function (e) {
                        var pageSize = $(this).val();
                        self.pageSize = pageSize;
                        self.pageAll = 0;
                        self.pageCurrent = 1;
                        self.allRows = 0;
                        self.refresh()
                    });
                self.$allRows = $('<span ></span>');
                self.$pageCurrent = $('<span ></span>');
                self.$pageAll = $('<span></span>');
                self.$form.append($('<span/>').text('每页:'))
                    .append(self.$pageSize).append($('<span/>').text('行 共'))
                    .append(self.$allRows).append($('<span/>').text('行 第'))
                    .append(self.$pageCurrent).append($('<span/>').text('页 共'))
                    .append(self.$pageAll).append($('<span>').text('页 '));
                self.$pageHome = $('<a>').text('首页').on('click', function () {
                    if (self.pageCurrent != 1) {
                        self.pageCurrent = 1;
                        self.refresh();
                    }
                });
                self.$pagePrev = $('<a>').text('上一页').on('click', function (e) {
                    if (self.pageCurrent > 1) {
                        self.pageCurrent--;
                        self.refresh();
                    }
                });
                self.$pageNext = $('<a>').text('下一页').on('click', function (e) {
                    if (self.pageCurrent < self.pageAll) {
                        self.pageCurrent++;
                        self.refresh();
                    }
                });
                self.$pageLast = $('<a>').text('尾页').on('click', function (e) {
                    if (self.pageAll != self.pageCurrent) {
                        self.pageCurrent = self.pageAll;
                        self.refresh();
                    }
                });
                self.$pageInput = $('<input type="text">');
                self.$pageGo = $('<a>').text('GO').on('click', function (e) {
                    var pageInput = self.$pageInput.val();
                    if (!pageInput)return;
                    var msg = '请输入正确的页数!', errMsg;
                    if (!/^\d+$/.test(pageInput)) {
                        errMsg = msg;
                    } else if (pageInput > self.pageAll || pageInput < 1) {
                        errMsg = msg;
                    }
                    if (errMsg) {
                        self.alert(errMsg);
                        return;
                    } else {
                        self.pageCurrent = pageInput;
                        self.refresh();
                    }
                });
                self.$form
                    .append(self.$pageHome).append(' ')
                    .append(self.$pagePrev).append(' ')
                    .append(self.$pageNext).append(' ')
                    .append(self.$pageLast).append(' ')
                    .append('页数：').append(self.$pageInput).append(' ')
                    .append(self.$pageGo);
                self.resetPageData();
            },

            init: function (options) {
                this.buildBody();
            },
            render: function (res, clean) {
                var self = this;
                self.allRows = res.allRows;
                self.pageAll = Math.ceil(self.allRows / self.pageSize) || 1;
                if (clean) {
                    self.pageCurrent = 1;
                }
                this.resetPageData();
            }
        }
        return PagerHelper;
    })();
    var QueryHelper = (function () {
        var QueryHelper = function ($parent, queryOptions) {
            this.$parent = $parent;
            var queryFields = queryOptions.queryFields || [], self = this;
            //this.dataHelper = dataHelper;
            this.queryFields = queryFields;
            this.nodes = [];
            this.nodesObj = {};
            this.idNodes = {};
            this.searchBtnFiledName = '';
            if (queryFields.length) {
                self.build();
            }
        };
        QueryHelper.prototype = {
            binding: function (dataHelper) {
                var self = this;
                this.dataHelper = dataHelper;
                var searchBtn = self.nodesObj[self.searchBtnFiledName];
                searchBtn && searchBtn.on('click', function () {
                    var data = self.getQueryData();
                    self.dataHelper.query(data);
                })
            },
            getQueryData: function () {
                var data = {};
                $.each(this.nodes, function (i, n) {
                    var node = n.node, field = n.field, val = node.val();
                    if (field == self.searchBtnFiledName) return;
                    if (val === '' || val === null || val === undefined)return;
                    data[field] = node.val();
                });
                return data;
            },
            build: function () {

                var self = this;
                var $body = $('<div style="margin-top:18px;" /> '),
                    $form = $('<form class="form form-inline" role="form"/>');
                $body.append($form);
                self.$body = $body;
                self.$form = $form;
                if (self.queryFields.length == 1 && self.queryFields[0].type == inputType.search) {
                    self.buildOneSearch();
                } else {
                    self.buildOthers();
                }
                self.addOtherOptions();
                self.$parent.append($body);

            },
            addOtherOptions: function () {
                var nodesObj = this.nodesObj = {}, self = this;
                for (var i in self.nodes) {
                    var obj = self.nodes[i], field = obj.field, node = obj.node;
                    nodesObj[field] = node;
                }
                $.each(this.queryFields, function (i, q) {
                    var validateFields = q.validateFields, clickHandler = q.clickHandler, changeHandler = q.changeHandler,
                        validate = q.validate, validateNodes = [], selfNode = nodesObj[q.field];
                    if (validateFields && validateFields.length > 0) {
                        $.each(validateFields, function (j, f) {
                            validateNodes.push(nodesObj[f]);
                        })
                    }
                    clickHandler && selfNode.on('click', function (e) {
                        clickHandler.call(selfNode, e, validateNodes)
                    });
                    var event = 'change';
                    if (q.type == inputType.date)event = 'focusout';
                    validate && selfNode.on(event, function (e) {
                        validate.call(selfNode, e, validateNodes)
                    });
                    changeHandler && selfNode.on(event, function (e) {
                        changeHandler.call(selfNode, e, validateNodes)
                    });
                });
                self.setFieldID();
            },
            defaultQueryBtnOpts: {
                type: inputType.searchBtn,
                field: 'searchBtn',
                label: '搜索'
            },
            buildQueryBtn: function (obj) {

                var input = $('<button type="button" class="btn btn-default">' + obj.label + '</button>')//,
                //outer = $('<div class="form-group"  style="float:right" />');
                this.searchBtnFiledName = obj.field;
                this.nodes.push({node: input, field: obj.field});

                return input;//outer.append(input);
            },
            buildField: function (obj) {
                var type = obj.type, $node;
                switch (type) {
                    case inputType.checkbox:
                        $node = this.buildCheckbox(obj);
                        break;
                    case inputType.text:
                        $node = this.buildText(obj);
                        break;
                    case inputType.radio:
                        $node = this.buildRadio(obj);
                        break;
                    case inputType.select:
                        $node = this.buildSelect(obj);
                        break;
                    case inputType.search:
                        $node = this.buildSearch(obj);
                        break;
                    case inputType.date:
                        $node = this.buildDate(obj);
                        break;
                    case inputType.searchBtn:
                        $node = this.buildQueryBtn(obj);
                        break;
                }
                obj.cssClass && $node.addClass(obj.cssClass);
                obj.style && $node.css(self.getStyleObj(obj.style));
                if (obj.controlFn && typeof obj.controlFn == 'function') {
                    obj.controlFn($node);
                }
                return $node;
            },
            getStyleObj: function (style) {
                var css = {};
                if ((typeof style) == 'string') {
                    var ss = style.split(';');
                    $.each(ss, function (i, s) {
                        var arr = s.split(':');
                        css[arr[0]] = arr[1];
                    });
                }
                return css;
            },
            buildText: function (obj) {
                var outer = $('<div class="form-group col-md-5"></div>').append('<label class="control-label col-md-5">' + obj.label + '</label>'),
                    input = $('<input type="text" class="form-control col-md-7" ' + (obj.placeholder ? ' placeholder="' + obj.placeholder + '"' : '') + '/>');
                this.nodes.push({node: input, field: obj.field});
                return outer.append(input);
            },
            buildCheckbox: function (obj) {
                //this.nodes.push({node:input,field:obj.field});
            },
            buildRadio: function (obj) {
                //this.nodes.push({node:input,field:obj.field});
            },
            buildDate: function (obj) {
                var outer = $('<div class="form-group col-md-5"></div>').append('<label class="control-label col-md-5">' + obj.label + '</label>'),
                    input = $('<input type="text" class="form-control col-md-7" />');
                var dateOptions = obj.dateOptions, opts = {dateFmt: 'yyyy-MM-dd'}, self = this;
                if (dateOptions)$.extend(opts, dateOptions);
                dateOptions.maxDate && (opts.maxDate = self.convertDate(opts.maxDate, obj));
                dateOptions.minDate && (opts.minDate = self.convertDate(opts.minDate, obj));
                //maxDate:'#F{$dp.$D(\'endTime\')}',
                //console.log(opts);
                input.on('click', function () {
                    WdatePicker.call(input[0], opts)
                });
                this.nodes.push({node: input, field: obj.field});
                return outer.append(input);
            },
            convertDate: function (str, obj) {
                if (!(/\$dp/.test(str)))return str;
                var idReg = /\$dp\.\$D\(\'(.+)\'/;
                var item = str.match(idReg)[1], id = Date.now();
                this.idNodes[item] = {value: id, prop: 'id'};
                return str.replace(item, id);
            },
            setFieldID: function () {
                var self = this;
                $.each(this.idNodes, function (field, obj) {
                    var node = self.nodesObj[field];
                    node.attr(obj.prop, obj.value);
                });
            },
            buildSearch: function (obj) {
                var self = this, field = obj.field;
                var div = $('<div class="form-group ' + (obj.cssClass || 'search') + '">'),
                    input = $('<input type="text" ' +
                        (obj.placeholder ? ' placeholder="' + obj.placeholder + '"' : '') +
                        ' />'),
                    a = $('<a ></a>');
                a.on('click', function () {
                    var val = input.val();
                    if (val === '' || !/^\w*$/.test(val))return;
                    var data = {};
                    data[field] = val;
                    self.dataHelper.search(data);
                })
                this.nodes.push({node: input, field: obj.field});
                return div.append(input).append(a);
            },
            buildSelect: function (obj) {
                var outer = $('<div class="form-group col-md-5"></div>').append('<label class="control-label col-md-5">' + obj.label + '</label>'),
                    select = $('<select class="form-control col-md-7" ' + (obj.placeholder ? ' placeholder="' + obj.placeholder + '"' : '') + '/>');
                obj.multiple !== undefined && select.attr('multiple', obj.multiple);
                var options = obj.options;
                (typeof options) == 'string' && (options = JSON.parse(options));
                $.each(options, function (i, o) {
                    select.append($('<option>', o));
                });
                this.nodes.push({node: select, field: obj.field});
                return outer.append(select);
                //this.nodes.push({node:input,field:obj.field});
            },
            buildOneSearch: function () {
                var self = this, obj = self.queryFields[0];
                self.buildSearch(obj);
            },
            buildOthers: function () {
                var self = this,
                    $formBody = $('<div class="container-fluid" >');//,$queryBody = $('<div class = "container-fluid" />')
                self.$formBody = $formBody;
                var queryBtnObj = null, col = [],
                    buildRow = function () {
                        var $row = $('<div class="row" ></div>');
                        $.each(col, function (i, n) {
                            $row.append(n);
                        });
                        self.$formBody.append($row);
                        col = [];
                    }
                $.each(self.queryFields, function (i, q) {
                    if (q.type == inputType.searchBtn) {
                        queryBtnObj = q;
                        return;
                    }
                    if (q.type == inputType.rowEnd) {
                        buildRow();
                    } else {
                        var $node = self.buildField(q);
                        col.push($node);
                    }
                });
                if (col.length) {
                    buildRow();
                }

                //build queryBtn
                var $queryBtn = self.buildQueryBtnNode(queryBtnObj);

                // build row
                var outerDiv = $('<div class="container-fluid" />'),
                    queryBtnDiv = $queryBtn,
                //queryBtnDiv = $('<div class="col-md-1" />'),
                    queryItemsDiv = $('<div class="col-md-11" />');
                queryItemsDiv.append($formBody);
                //queryBtnDiv.append($queryBtn);
                outerDiv.css('position', 'relative');
                queryBtnDiv.css({position: 'absolute', right: '0', bottom: '10px'});
                self.$form.append(outerDiv.append(queryItemsDiv).append(queryBtnDiv));
            },
            buildQueryBtnNode: function (queryBtnObj) {
                var self = this;
                queryBtnObj == queryBtnObj || {};
                var newObj = {};
                $.extend(newObj, self.defaultQueryBtnOpts, queryBtnObj);
                $.extend(queryBtnObj, newObj);

                return self.buildField(queryBtnObj);
            }
        };
        return QueryHelper;
    })();
    var DataHelper = (function () {
        var DataHelper = function (options) {
            options = options || {};
            this.opts = {};
            $.extend(true, this.opts, this.defaultOpts, options);
            this.convertUrl();
            this.init();
        }
        DataHelper.prototype = {
            defaultOpts: {
                type: 'GET',//'POST'
                ajaxFields: {
                    req: {
                        currentPageField: 'currentPage',
                        pageSizeField: 'size'
                    },
                    res: {
                        dataCountField: 'count',
                        dataField: 'data'
                    }
                },
                param: function () {
                    return null
                }
                //,..others
            },
            defaultPageOpts: {
                pageSize: 10,
                allRows: 1,
                pageAll: 1,
                pageCurrent: 1
            },
            convertUrl: function () {
                var url = this.opts.url, urlSegment = url.split('?'), urlData = {};
                this.url = urlSegment[0];

                if (urlSegment[1]) {
                    $.each(urlSegment[1].split('&'), function (i, arg) {
                        var arr = arg.split('=');
                        urlData[arr[0]] = arr[1];
                    });
                }
                this.urlData = urlData;
            },
            init: function (options) {
                var self = this;
                self.searchData = null;
                self.pageData = {};
                $.extend(self.pageData, self.defaultPageOpts);
                self.queryData = null;
                self.tableData = null;
                self.paramData = this.getParamData();
                self.alert = function (res) {
                    self.onError(res);
                    //window.alert(res);
                };
                self.onError = function (res) {
                    res = res||'请求返回失败！';
                    window.alert(res);
                };
            },
            getParamData: function () {
                var data = null, self = this, type = typeof self.opts.param;
                if (type == 'object') {
                    data = self.opts.param;
                } else if (type == 'function') {
                    data = self.opts.param();
                    if (typeof data != 'object')return null;
                }
                return data;
            },
            refreshWithLocalData: function (data) {
                this.localData = data;
                this.queryData = null;
                this.pageData = null;
                this.tableData = null;
                this.searchData = null;
                return this.refresh();
            },
            query: function (data) {
                this.searchData = null;
                this.pageData = null;
                this.tableData = null;
                this.queryData = data;
                this.localData = null;
                return this.refresh();
            },
            search: function (data) {
                this.queryData = null;
                this.pageData = null;
                this.tableData = null;
                this.searchData = data;
                this.localData = null;
                return this.refresh();
            },
            refreshTable: function (data) {
                //this.queryData = null;
                //this.pageData = null;
                this.tableData = data;
                //this.searchData = null;
                return this.refresh();
            },
            refreshPage: function (data) {
                this.pageData = data;
                return this.refresh();
            },
            refresh: function () {
                this.loadingStart();
                var data = {}, newPageData;
                if (this.pageData) {
                    newPageData = {pageCurrent: this.pageData.pageCurrent, pageSize: this.pageData.pageSize}
                } else {
                    newPageData = {
                        pageCurrent: this.defaultPageOpts.pageCurrent,
                        pageSize: this.defaultPageOpts.pageSize
                    }
                }
                $.extend(data, newPageData);
                if (this.searchData)$.extend(data, this.searchData);
                if (this.queryData)$.extend(data, this.queryData);
                if (this.tableData)$.extend(data, this.tableData);
                if (this.paramData)$.extend(data, this.paramData);
                return this.refreshWithData(data);
            },
            refreshWithData: function (data) {
                var newData = this.convertAjaxData(data),
                    self = this,
                    p = this.fetch(newData),
                    dfd = $.Deferred();
                p.done(function (res) {
                    if (!res) {
                        dfd.reject();
                        return;
                    }
                    var newRes = self.convertResultData(res);
                    dfd.resolve(newRes);
                    self.renderWithNewData(newRes);
                }).fail(function (e) {
                    dfd.reject(e);
                });
                return dfd.promise();
            },
            renderWithNewData: function (res) {
                var data = res.data;
                this.resetTable(data);
                this.resetPage(res);
                this.completeCallback && this.completeCallback();
            },
            convertAjaxData: function (data) {
                var opt = this.opts.ajaxFields.req, self = this;
                self.replaceField('pageSize', opt.pageSizeField, data);
                self.replaceField('pageCurrent', opt.currentPageField, data);
                return data;
            },
            replaceField: function (oField, nField, data) {
                var val = data[oField];
                if (val !== null && val !== undefined) {
                    delete data[oField];
                    data[nField] = val;
                }
            },
            convertResultData: function (data) {
                var opt = this.opts.ajaxFields.res, self = this;

                if ($.isArray(data)) {
                    var newData = {};
                    newData.data = data;
                    newData.allRows = data.length;
                    data = newData;
                } else {
                    if (opt) {
                        opt.dataField && self.replaceField(opt.dataField, 'data', data);
                        opt.dataCountField && self.replaceField(opt.dataCountField, 'allRows', data);
                    }
                }
                return data;
            },
            fetch: function (data) {//todo 应该加个lock防止多次不同的查询，返回结果会有影响
                if (this.localData)return this.fetchLocal(data);
                var dfd = $.Deferred(), type = /get/i.test(this.opts.type) ? "GET" : "POST", self = this;
                var newData = {};
                $.extend(newData, this.urlData, data);
                newData = type == 'GET' ? newData : JSON.stringify(newData);
                $.ajax({
                    url: this.url,
                    data: newData,
                    type: type,
                    dataType: 'json',
                    contentType: 'application/json;charset=UTF-8',
                    cache: true,
                    success: function (res) {
                        dfd.resolve(self.gotData(res));
                    },
                    error: function (xhr, err, err) {
                        self.onError.apply(self, arguments);
                        dfd.reject(xhr, err, err);
                    }
                });
                return dfd.promise();
            },
            gotData: function (res) {
                var obj = {data: res}, self = this;
                if (self.dataLoadedCallback) {
                    var data = self.dataLoadedCallback(res);
                    if (data != res && data) {
                        obj.data = data;
                    }
                }
                return obj.data;
            },
            fetchLocal: function (data) {
                var dfd = $.Deferred(), res, self = this;
                if (res = this.localData) {
                    dfd.resolve(self.gotData(res));
                } else {
                    self.onError.apply(self, ["暂无数据"]);
                    dfd.reject();
                }
                return dfd.promise();
            },
            resetPage: function (res) {
                this.pagerHelper.render(res, !this.pageData);
            },
            resetTable: function (data) {
                this.tableHelper.render(data, !this.tableData);
            },
            binding: function (tableHelper, queryHelper, pagerHelper) {
                this.tableHelper = tableHelper;
                tableHelper.binding(this);
                if (queryHelper) {
                    this.queryHelper = queryHelper;
                    queryHelper.binding(this);
                }
                if (pagerHelper) {
                    this.pagerHelper = pagerHelper;
                    pagerHelper.binding(this);
                } else {
                    this.resetPage = function () {
                    }
                    this.pageData = null;
                }

                return this;
            },
            onDataLoaded: function (callback) {
                this.dataLoadedCallback = callback;
            },
            loadingStart: function () {
                this.loadingTable();
            },
            loadingTable: function () {
                this.tableHelper.loading();
            },
            loadingPage: function () {

            },
            onCompleted: function (callback) {
                this.completeCallback = callback;
            }
        }
        return DataHelper;
    })();


    var bootstrapTable = function (columns, options) {
        var $this = $(this);
        $this.empty();

        var
            dh = new DataHelper(options),
            qh = options.query === false ? null : new QueryHelper($this, options),
            th = new TableHelper($this, columns, options),
            ph = options.page === false ? null : new PagerHelper($this, options);
        dh.binding(th, qh, ph);
        var outer = {
            onDataLoaded: function (callback) {
                dh.onDataLoaded(callback);
            },
            setAlert: function (fun) {
                var self = this;
                fun && (dh.alert = function () {
                    fun.apply(self, arguments);
                });
            },
            refresh: function () {
                dh.refresh();
            },
            query: function (data) {
                dh.query(data);
            },
            getPageData: function () {
                var data = {};
                if (ph) {
                    $.extend(data, ph.pageData);
                }
                return data;
            },
            onError: function (fun) {
                var self = this;
                fun && (dh.onError = function (jqXHR, textStatus, errorThrown) {
                    fun && fun.apply(self, arguments);
                });
            },
            onNoDataRenderRow: function (fun) {

            },
            onCompleted: function (fun) {
                fun && dh.onCompleted(fun)
            },
            drawTableWithData: function (data) {
                dh.refreshWithLocalData(data);
            }

        };
        return outer;
    };
    bootstrapTable.inputType = inputType;
    bootstrapTable.dataType = dataType;
    $.fn.bootstrapTable = bootstrapTable;
})(jQuery);

