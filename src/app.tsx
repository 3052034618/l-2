import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
// 全局样式
import './app.scss';
import { useInventoryInit } from './store/inventory';
import { useDisplayInit } from './store/display';
import { useTasksInit } from './store/tasks';
import { useReplenishmentInit } from './store/replenishment';

function App(props) {
  useInventoryInit();
  useDisplayInit();
  useTasksInit();
  useReplenishmentInit();

  useEffect(() => {});

  // 对应 onShow
  useDidShow(() => {});

  // 对应 onHide
  useDidHide(() => {});

  return props.children;
}

export default App;
