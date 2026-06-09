export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/inventory/index',
    'pages/display/index',
    'pages/tasks/index',
    'pages/ranking/index',
    'pages/product-detail/index',
    'pages/replenishment/index',
    'pages/inspection-record/index',
    'pages/low-stock-setting/index',
    'pages/loss-profit/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '智慧零售',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '今日看板'
      },
      {
        pagePath: 'pages/inventory/index',
        text: '库存盘点'
      },
      {
        pagePath: 'pages/display/index',
        text: '陈列检查'
      },
      {
        pagePath: 'pages/tasks/index',
        text: '任务消息'
      },
      {
        pagePath: 'pages/ranking/index',
        text: '门店排行'
      }
    ]
  }
})
