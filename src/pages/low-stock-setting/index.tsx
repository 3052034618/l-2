import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInventoryStore } from '@/store/inventory';
import { lowStockSettings } from '@/data/inventory';

interface CategorySetting {
  categoryId: string;
  categoryName: string;
  icon: string;
  bgColor: string;
  minStock: number;
  notifyEnabled: boolean;
}

const LowStockSettingPage: React.FC = () => {
  const { updateMinStock, products } = useInventoryStore();

  const [settings, setSettings] = useState<CategorySetting[]>(() =>
    lowStockSettings.map(item => {
      const categoryProducts = products.filter(p => p.categoryId === item.categoryId);
      const avgMinStock = categoryProducts.length > 0
        ? Math.round(categoryProducts.reduce((sum, p) => sum + p.minStock, 0) / categoryProducts.length)
        : item.minStock;

      return {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        icon: item.icon,
        bgColor: item.bgColor || '#e8f3ff',
        minStock: avgMinStock,
        notifyEnabled: true
      };
    })
  );

  const handleThresholdChange = (index: number, value: string) => {
    const num = parseInt(value) || 0;
    const newSettings = [...settings];
    newSettings[index] = {
      ...newSettings[index],
      minStock: Math.max(0, num)
    };
    setSettings(newSettings);
  };

  const handleToggleNotify = (index: number) => {
    const newSettings = [...settings];
    newSettings[index] = {
      ...newSettings[index],
      notifyEnabled: !newSettings[index].notifyEnabled
    };
    setSettings(newSettings);
  };

  const handleSave = () => {
    settings.forEach(setting => {
      updateMinStock(setting.categoryId, setting.minStock);
    });
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.tipCard}>
        <Text className={styles.tipIcon}>💡</Text>
        <Text className={styles.tipText}>
          当商品库存低于设置的阈值时，系统会自动标记为低库存状态，并在今日看板和库存盘点页面提醒补货。
        </Text>
      </View>

      <ScrollView className={styles.settingList} scrollY>
        {settings.map((setting, index) => (
          <View key={setting.categoryId} className={styles.categoryCard}>
            <View className={styles.categoryHeader}>
              <View
                className={styles.categoryIcon}
                style={{ background: setting.bgColor }}
              >
                <Text>{setting.icon}</Text>
              </View>
              <View className={styles.categoryInfo}>
                <Text className={styles.categoryName}>{setting.categoryName}</Text>
                <Text className={styles.categoryDesc}>
                  共 {products.filter(p => p.categoryId === setting.categoryId).length} 种商品
                </Text>
              </View>
            </View>

            <View className={styles.thresholdInputRow}>
              <Text className={styles.thresholdLabel}>低库存阈值</Text>
              <View className={styles.thresholdInputWrapper}>
                <Input
                  className={styles.thresholdInput}
                  type="number"
                  value={String(setting.minStock)}
                  onInput={e => handleThresholdChange(index, e.detail.value)}
                />
                <Text className={styles.thresholdUnit}>件</Text>
              </View>
            </View>

            <View className={styles.notifyToggle}>
              <Text className={styles.toggleLabel}>库存预警通知</Text>
              <View
                className={classnames(styles.switch, setting.notifyEnabled && styles.active)}
                onClick={() => handleToggleNotify(index)}
              />
            </View>
          </View>
        ))}

        <View style={{ height: '120rpx' }} />
      </ScrollView>

      <View className={styles.saveBar}>
        <View className={styles.saveBtn} onClick={handleSave}>
          <Text>保存设置</Text>
        </View>
      </View>
    </View>
  );
};

export default LowStockSettingPage;
