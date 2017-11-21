# js-table

一个js生成table的插件，可以带翻页，等等，结合bootstrap


这里只通过注释列出各种方法和使用方式。具体的demo实例请从通过查看现有功能里的具体代码。


     var target = '#target',
          $target = $(target),//table的父节点，用于存储容纳table
          table,//table对象，用于操作表格，会在后续添加
          dataType = $target.bootstrapTable.dataType,//table中组件的类型：image、html、text、checkbox、radio
          columns = [
              {
                  label: '商品描述', col: 'width:30%', field: 'col1',
                  content: [   //如果该Cell里有多个字段则用content
                      {field: 'checked', type: dataType.checkbox},
                      {
                          renderCell: function (value, td, data) {
                              console.log(arguments);
      
                          }
                      },//自定义内容
                      {field: 'image', type: dataType.image},
                      {field: 'desc', type: dataType.text}
                  ],
                  afterHeaderRender: function (td) {//表头创建完成回调
      
                  },
                  afterRender: function (td, data) {//当td创建后返回对象，可以增加事件等等操作
                      var checkbox = td.find('input[type=checkbox]');
                      checkbox.on('change', function () {
                          alert(checkbox.prop('checked'));
                      });
                  }
              },
              {
                  label: '当前状态', col: 'width:10%', field: 'col2',
                  'cssClass': '',//cell的class
                  style: '',//cell的样式
                  headerClass: '',//表头的class
                  headerStyle: ''//表头的样式
              },
              {
                  label: '本期库存', col: 'width:10%', field: 'col3',
                  sort: true//启用排序，请求时增加 col3-desc col3-asc的字段
              },
              {label: '本月销量', col: 'width:10%', field: 'col4'},
              {label: '本期销量', col: 'width:10%', field: 'col5', sort: true},
              {label: '分类', field: 'col6'},
              {label: '更新时间', field: 'col7'},
              {
                  label: '操作', field: 'col8',
                  renderCell: function (value, td, data) {//自定义cell，
                      // value为该单元格的值，td为单元格的jquery对象，data为该行的数据对象
                      var outer = $('<div class="twoBtn" />');
                      var $update = $('<button>修改</button>').click(function (e) {
                              var id = data.col1;
                              console.log('update id');
                              table.refresh();
                          }),
                          $delete = $('<button>删除</button>').click(function (e) {
                              console.log('delete');
                              table.refresh();
                          });
                      td.append(outer.append($update).append($delete));//如果不使用td.append
                      // 则直接返回创建的单元格对象 如，return outer
                  }
              }
          ];
      var url = './sample.json?test=' + Date.now();//请求数据的url
      var table = demoTable($target, url, data, columns);
      table.onDataLoaded(function (res) {//重组返回数据方法，
          // 可不写，ajax请求直接返回的对象
          $.each(res.data, function (i, d) {
              d.col3 = d.col3 + (i + 1);
          });
      });
      table.onCompleted(function () {//table绘制完成后执行的操作。
          alert("table completed");
      });
      table.refresh();//刷新数据
      table.query({t: 't'});//查询数据
      //$(".desc").text($(this).text());
      
      
      var demoTable = function (target, url, columns) {
          var selectData = '[{"text":0,"value":0},{"text":1,"value":1},{"text":2,"value":2},{"text":3,"value":3},{"text":4,"value":4}]'
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
              tableClass: 'gridTable', //default table class
              NoDataRowText: 'no Value',// 默认'没有数据！',
              emptyRowClass: 'emptyRow',
              showNoData: false,//在没有数据返回时显示NoDAtaRowText的内容，默认true
              filterNullValue: true,//处理空值内容 m默认false
              noValues: [null, 'null', 'undefined', undefined],//判断空值的内容，默认为[null,'null','undefined',undefined]
              NullDataText: '-',// 字段值为空时显示的字符
              param: {param: 12},//function(){return {param:12}},//查询参数，每次查询时都加入该查询条件.可以是Json数据或者能返回json数据方法。
              url: url,
              page: false,//使用分页，默认true
              query: false,//使用查询控件
              //default opts
              type: 'GET',//'POST'
              ajaxFields: {
                  req: {//请求字段设置
                      currentPageField: 'currentPage',//默认当前页字段currentPage
                      pageSizeField: 'size'//默认每页条数字段size
                  },
                  res: {//相应字段设置
                      dataCountField: 'count',//默认总记录条数字段count,用于分页
                      dataFiled: 'data'//返回数据字段，用于取table数据，可以在table.onDataLoaded重构数据
                  },
                  defaultPageOpts: {
                      pageSize: 10,//默认的每页条数
                      pageSizes: [5, 10, 20, 50, 100]//分页
                  },
              },
              queryFields: [
                  {
                      type: types.search, field: 'name', placeholder: '请输入商品名称', controlFn: function ($node) {
                      $node.find('input').val('test');
                  }
                  },//搜索框
                  {
                      type: types.searchBtn,//查询按钮
                      label: '查询',
                      validateFields: ['name', 'select', 'startTime', 'endTime'],//其他查询的字段的filed属性，
                      // 可以在clickHandler,validate等方法中获取到其他字段的jquery对象
                      clickHandler: function (e, validateFields) {// 定义点击事件。
                          // validateFields为前面validateFields设置的filed字段的dom的jquery对象。
                          var name = validateFields[0].val(),
                              select = validateFields[1].val(),
                              startTime = validateFields[2].val(),
                              endTime = validateFields[3].val();
                          console.log(name, select, startTime, endTime);
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
                          if (!endTime) return true;
                          if ((convertDate(endTime)).getTime() < (convertDate(startTime)).getTime()) {
                              $(this).val('').focus();
                          }
                          return true;
      
                      }
                  },
                  {
                      type: types.date, field: 'endTime',
                      dateOptions: {minDate: '#F{$dp.$D(\'startTime\')}'}, label: '结束日期', validateFields: ['startTime'],
                      validate: function (e, validateFields) {
                          var startTime = validateFields[0].val(),
                              endTime = $(this).val();
                          //console.log(new Date(startTime),endTime);
                          if (!startTime) return true;
                          if ((convertDate(endTime)).getTime() < (convertDate(startTime)).getTime()) {
                              $(this).val('').focus();
                          }
                          return true;
                      }
                  }
      
              ]
          }
          var bootstrapTable = $target.bootstrapTable(columns, tableOpts);
          return bootstrapTable;
      }
      //{//table对象 方法
      //  onDataLoaded(fun(res){return res}),//fun为重组返回数据方法，可不写，res ajax请求直接返回的对象,可做修改或者直接替换。
      //  onCompleted(fun),//fun为table绘制完成后的处理方法，可不写。
      //  setAlert(fun)//fun为alert的方法。默认ajax请求出错时调用，建议使用onError
      //  refresh()://刷新，之前查询条件保留，包括分页。
      //  query(data)://已data为查询条件，分页信息丢失
      //  getPageData()://返回分页信息对象,
      //  onError(fun)//fun为ajax请求出错时调用的方法，默认调setAlert里的设定
      //}
      //使用table查询数据的入口为refresh或者query。
 