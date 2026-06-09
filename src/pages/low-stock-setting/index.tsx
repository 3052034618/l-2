import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const LowStockSettingPage: React.FC = () => {
  return (
    <View className={styles.page}>
      <Text className={styles.icon}>⚙️</Text>
      <Text className={styles.title}>低库存设置</Text>
      <Text className={styles.desc}>功能正在开发中...</Text>
      <View className={styles.backBtn} onClick={() => Taro.navigateBack()}>
        <Text>返回</Text>
      </View>
    </View>
  );
};

export default LowStockSettingPage;
