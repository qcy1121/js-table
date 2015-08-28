$(function () {


var tableObj = {};
var drawTable = function (target) {
    var data = '[{"text":0,"value":0},{"text":1,"value":1},{"text":2,"value":2},{"text":3,"value":3},{"text":4,"value":4}]',
        $target = $(target),
        dataType = $target.bootstrapTable.dataType,
        columns = [
            {
                label: '商品描述', col: 'width:30%', field: 'col1',// style: 'background-color:red;',
                content: [
                    {field: 'checked', type: dataType.checkbox},
                    {
                        renderCell: function (value, td, data) {//自定义内容
                            var warper = $('<span class="checkboxwrap">');
                            var node = $('<input>', {type: 'checkbox', name: 'check', 'data-id': 'test'});
                            return warper.append(node);
                        }
                    },
                    {field: 'image', type: dataType.image},
                    {field: 'desc', type: dataType.text}
                ],
                afterRender: function (td, data) {//当td创建后返回对象，可以增加事件等等操作
                    var checkbox = td.find('input[type=checkbox]');
                    checkbox.on('change', function () {
                        //alert(checkbox.prop('checked'));
                    }).attr('res', 'res');
                },
                afterHeaderRender: function (td, col) {
                    var checkbox = $('<input>', {type: 'checkbox'}).on('change', function () {
                        var val = checkbox.prop('checked');
                        $.each(col, function (i, row) {
                            row.find('input[type=checkbox]').prop('checked', val);
                        });
                    });
                    td.prepend($('<span class="checkboxwrap">').append(checkbox));
                }
            },
            //renderCell:function(value,data,td){}
            {
                label: '当前状态',
                col: 'width:10%',
                field: 'col2',
                'cssClass': '',
                style: '',
                headerClass: '',
                headerStyle: ''
            },
            {label: '本期库存', col: 'width:10%', field: 'col3', sort: true},
            {label: '本月销量', col: 'width:10%', field: 'col4'},
            {label: '本期销量', col: 'width:10%', field: 'col5', sort: true},
            {label: '分类', field: 'col6'},
            {label: '更新时间', field: 'col7'},
            {
                label: '操作', field: 'col8', renderCell: function (value, td, data) {
                var outer = $('<div class="twoBtn" />');
                var $update = $('<button>修改</button>').click(function (e) {
                        var id = data.col1;
                        console.log('update id');
                        tableObj[target].refresh();
                    }),
                    $delete = $('<button>删除</button>').click(function (e) {
                        console.log('delete');
                        tableObj[target].refresh();
                    });
                td.append(outer.append($update).append($delete));
            }
            }
        ];
    if ($target.find('table').length < 1) {

        var url = './sample.json';
        var table = tableObj[target] = demoTable($target, url, data, columns);
        table.onDataLoaded(function (res) {
            $.each(res.data, function (i, d) {
                d.col3 = d.col3 + (i + 1);
            });
        });
        table.onCompleted(function () {
            console.log('completed');
        });
        table.refresh();
        //$.ajax(url).done(function (res) {
        //    var d = res.data.concat();
        //    $.each(d, function (i, c) {
        //        res.data.push(c);
        //    })
        //    table.drawTableWithData(res);
        //})
    }
    //$(".desc").text($(this).text());
}


var demoTable = function (target, url, selectData, columns) {

    var $target = $(target),
        types = $target.bootstrapTable.inputType,
        dataType = $target.bootstrapTable.dataType;
    $target.addClass('bootstrapTableDiv');
    var convertDate = function (str) {
        var arr = str.split('-');
        return new Date(arr[0], arr[1], arr[2]);
    }

    url = url || './sample.json';
    var tableOpts = {
        //tableClass:'gridTable', //default table class
        //NoDataRowText:'no Value',// 默认'没有数据！',
        //emptyRowClass:'emptyRow',
        //showNoData:false,//在没有数据返回时显示NoDAtaRowText的内容，默认true
        //filterNullValue:true,//处理空值内容 m默认false
        //noValues:[null,'null','undefined',undefined],//判断空值的内容，默认为[null,'null','undefined',undefined]
        //NullDataText:'无数据',// 字段值为空时显示的字符
        param: {param: 12},//function(){return {param:12}},//查询参数，每次查询时都加入该查询条件
        url: url,
        type: 'POST',//'GET'
        //page:false,
        //query:false,
        /* default opts
         ajaxFields:{
         req:{
         currentPageField:'currentPage',
         pageSizeField:'size'
         },
         res:{
         dataCountField:'count',
         dataFiled:'data'
         }
         },
         */
         pageSettings:{
            pageSize:30,
            pageSizes:[5,15,30,50]
         },

        queryFields: [
            //{type:types.search,field:'name',placeholder:'请输入商品名称',controlFn:function($node){$node.find('input').val('test');}}//,
            {
                type: types.searchBtn,
                label: '查询',
                validateFields: ['name', 'select', 'startTime', 'endTime'],
                clickHandler: function (e, validateFields) {
                    var name = validateFields[0].val(),
                        select = validateFields[1].val(),
                        startTime = validateFields[2].val(),
                        endTime = validateFields[3].val();
                    //console.log(name,select,startTime,endTime);
                }
            },
            {type: types.text, field: 'name', label: '测试字段'},
            {type: types.select, field: 'select', label: '请选择', options: selectData},//,multiple:false},
            {type: types.rowEnd},//换行
            {
                type: types.date, field: 'startTime', label: '开始日期', validateFields: ['endTime'],
                dateOptions: {maxDate: '#F{$dp.$D(\'endTime\')}', minDate: '%y-%M-%d'},
                validate: function (e, validateFields) {
                    var endTime = validateFields[0].val(),
                        startTime = $(this).val();
                    //console.log(endTime,startTime);
                    if (!endTime)return true;
                    if ((convertDate(endTime)).getTime() < (convertDate(startTime)).getTime()) {
                        $(this).val('').focus();
                    }
                    return true;

                }
            },
            {
                type: types.date,
                field: 'endTime',
                dateOptions: {minDate: '#F{$dp.$D(\'startTime\')}'},
                label: '结束日期',
                validateFields: ['startTime'],
                validate: function (e, validateFields) {
                    var startTime = validateFields[0].val(),
                        endTime = $(this).val();
                    //console.log(new Date(startTime),endTime);
                    if (!startTime)return true;
                    if ((convertDate(endTime)).getTime() < (convertDate(startTime)).getTime()) {
                        $(this).val('').focus();
                    }
                    return true;
                }
            }

        ],

        //renderTableRow:function(idx,rowdata,tbody) {
        //    var html = "<tr>";
        //    $.each(rowdata,function(i,d){
        //        html+=('<td>'+i+"</td>");
        //    });
        //
        //    return html+"</tr>";
        //},
        //renderTable:function(data,div){
        //    var html = '<table>',header="<thead>",body = "<tbody>";
        //    $.each(data[0],function(i,d){
        //        header+="<td>"+i+"</td>"
        //    });
        //    header +="</thead>";
        //    $.each(data,function(i,rowdata){
        //        var row = '<tr>';
        //        $.each(rowdata,function(idx,d){
        //            row+="<td>"+d+"</td>";
        //        });
        //        body+=row+'</tr>';
        //    })
        //    body+="</tbody>";
        //    html+=header+body+'</table>';
        //    console.log(html);
        //    div.append(html);
        //    //return html;
        //}
    }
    var bootstrapTable = $target.bootstrapTable(columns, tableOpts);
    return bootstrapTable;
}

   drawTable($("#allTab"));
});