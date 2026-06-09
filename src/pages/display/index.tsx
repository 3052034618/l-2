import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { shelfList, displayRecords, checkItems } from '@/data/display';
import SectionHeader from '@/components/SectionHeader';

const DisplayPage: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>(['1', '2', '3']);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const stats = {
    total: shelfList.length,
    checked: shelfList.filter(s => s.status === 'checked').length,
    abnormal: shelfList.filter(s => s.status === 'abnormal').length
  };

  const handleTakePhoto = () => {
    console.log('[Display] 拍照记录');
    Taro.showToast({ title: '拍照功能', icon: 'none' });
  };

  const handleShelfClick = (shelfId: string) => {
    console.log('[Display] 点击货架:', shelfId);
    Taro.showToast({ title: '货架详情', icon: 'none' });
  };

  const toggleCheckItem = (itemId: string) => {
    setCheckedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      checked: '已检查',
      pending: '待检查',
      abnormal: '异常'
    };
    return map[status] || status;
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 顶部卡片 */}
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>今日陈列检查</Text>
        <Text className={styles.headerDesc}>请按区域完成货架陈列检查</Text>
        <View className={styles.headerStats}>
          <View className={styles.headerStat}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>总区域</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.statNum}>{stats.checked}</Text>
            <Text className={styles.statLabel}>已检查</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.statNum}>{stats.abnormal}</Text>
            <Text className={styles.statLabel}>异常</Text>
          </View>
        </View>
      </View>

      {/* 货架区域 */}
      <View className={styles.section}>
        <SectionHeader title="货架区域" extra="查看全部" showArrow />
        <View className={styles.shelfGrid}>
          {shelfList.map(shelf => (
            <View
              key={shelf.id}
              className={styles.shelfCard}
              onClick={() => handleShelfClick(shelf.id)}
            >
              <View
                className={classnames(styles.shelfStatus, styles[shelf.status])}
              >
                <Text>{getStatusText(shelf.status)}</Text>
              </View>
              <View className={styles.shelfIcon}>
                <Text>🏪</Text>
              </View>
              <Text className={styles.shelfName}>{shelf.name}</Text>
              <Text className={styles.shelfCategory}>{shelf.category}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 检查清单 */}
      <View className={styles.section}>
        <SectionHeader title="检查清单" />
        <View className={styles.checkSection}>
          {checkItems.map(item => (
            <View
              key={item.id}
              className={styles.checkItem}
              onClick={() => toggleCheckItem(item.id)}
            >
              <View
                className={classnames(
                  styles.checkBox,
                  checkedItems.includes(item.id) && styles.checked
                )}
              >
                {checkedItems.includes(item.id) && (
                  <Text className={styles.checkIcon}>✓</Text>
                )}
              </View>
              <Text
                className={classnames(
                  styles.checkText,
                  item.required && styles.required
                )}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 陈列记录 */}
      <View className={styles.section}>
        <SectionHeader title="最近记录" extra="更多" showArrow />
        <View className={styles.recordList}>
          {displayRecords.slice(0, 2).map(record => (
            <View key={record.id} className={styles.recordCard}>
              <View className={styles.recordHeader}>
                <Text className={styles.recordShelf}>{record.shelfName}</Text>
                <View
                  className={classnames(
                    styles.recordStatusBadge,
                    styles[record.status]
                  )}
                >
                  <Text>{record.status === 'normal' ? '正常' : '异常'}</Text>
                </View>
              </View>
              <ScrollView className={styles.recordImages} scrollX>
                {record.images.map((img, idx) => (
                  <Image
                    key={idx}
                    className={styles.recordImg}
                    src={img}
                    mode="aspectFill"
                  />
                ))}
              </ScrollView>
              {record.remark && (
                <Text className={styles.recordRemark}>{record.remark}</Text>
              )}
              <Text style={{ fontSize: '22rpx', color: '#86909c', marginTop: '16rpx' }}>
                {record.createTime}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: '160rpx' }} />

      {/* 拍照按钮 */}
      <View className={styles.takePhotoBtn} onClick={handleTakePhoto}>
        <Text className={styles.btnIcon}>📸</Text>
        <Text>拍照记录陈列</Text>
      </View>
    </ScrollView>
  );
};

export default DisplayPage;
