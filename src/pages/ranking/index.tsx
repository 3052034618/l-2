import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { storeRanking, inspectionRecords } from '@/data/ranking';
import SectionHeader from '@/components/SectionHeader';

type RankType = 'sales' | 'traffic' | 'completion';

const RankingPage: React.FC = () => {
  const [rankType, setRankType] = useState<RankType>('sales');
  const [refreshing, setRefreshing] = useState(false);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const myStoreId = '4'; // 望京店

  const myStore = useMemo(() => {
    return storeRanking.find(s => s.id === myStoreId);
  }, []);

  const sortedStores = useMemo(() => {
    const list = [...storeRanking];
    switch (rankType) {
      case 'sales':
        return list.sort((a, b) => b.todaySales - a.todaySales);
      case 'traffic':
        return list.sort((a, b) => b.todayTraffic - a.todayTraffic);
      case 'completion':
        return list.sort((a, b) => b.completionRate - a.completionRate);
      default:
        return list;
    }
  }, [rankType]);

  const myRank = useMemo(() => {
    return sortedStores.findIndex(s => s.id === myStoreId) + 1;
  }, [sortedStores, myStoreId]);

  const rankTypes = [
    { key: 'sales', label: '销售额' },
    { key: 'traffic', label: '客流' },
    { key: 'completion', label: '完成率' }
  ];

  const handleShare = () => {
    console.log('[Ranking] 分享巡店记录');
    Taro.showToast({ title: '分享给区域经理', icon: 'success' });
  };

  const handleRecordClick = (recordId: string) => {
    console.log('[Ranking] 查看巡店记录:', recordId);
    Taro.navigateTo({ url: '/pages/inspection-record/index' });
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'top1';
    if (rank === 2) return 'top2';
    if (rank === 3) return 'top3';
    return '';
  };

  const getMainValue = (store: typeof storeRanking[0]) => {
    switch (rankType) {
      case 'sales':
        return `¥${store.todaySales.toFixed(0)}`;
      case 'traffic':
        return `${store.todayTraffic}人`;
      case 'completion':
        return `${(store.completionRate * 100).toFixed(1)}%`;
      default:
        return '';
    }
  };

  const getSubValue = (store: typeof storeRanking[0]) => {
    const growth =
      rankType === 'sales'
        ? (store.todaySales - store.yesterdaySales) / store.yesterdaySales
        : (store.todayTraffic - store.yesterdayTraffic) / store.yesterdayTraffic;
    const prefix = growth >= 0 ? '+' : '';
    return `${prefix}${(growth * 100).toFixed(1)}%`;
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 我的门店卡片 */}
      {myStore && (
        <View className={styles.headerCard}>
          <Text className={styles.myStoreLabel}>我的门店</Text>
          <Text className={styles.myStoreName}>{myStore.name}</Text>
          <View className={styles.myStoreRank}>
            <Text className={styles.rankNum}>第{myRank}名</Text>
          </View>
          <View className={styles.myStoreStats}>
            <View className={styles.myStat}>
              <Text className={styles.myStatValue}>¥{myStore.todaySales.toFixed(0)}</Text>
              <Text className={styles.myStatLabel}>今日销售额</Text>
            </View>
            <View className={styles.myStat}>
              <Text className={styles.myStatValue}>{myStore.todayTraffic}人</Text>
              <Text className={styles.myStatLabel}>今日客流</Text>
            </View>
            <View className={styles.myStat}>
              <Text className={styles.myStatValue}>
                {(myStore.completionRate * 100).toFixed(1)}%
              </Text>
              <Text className={styles.myStatLabel}>完成率</Text>
            </View>
          </View>
        </View>
      )}

      {/* 排行类型切换 */}
      <View className={styles.switchTabs}>
        {rankTypes.map(type => (
          <View
            key={type.key}
            className={classnames(
              styles.switchTab,
              rankType === type.key && styles.active
            )}
            onClick={() => setRankType(type.key as RankType)}
          >
            <Text>{type.label}</Text>
          </View>
        ))}
      </View>

      {/* 排行榜 */}
      <View className={styles.rankingSection}>
        <SectionHeader title="门店排行" />
        <View className={styles.rankList}>
          {sortedStores.map((store, index) => (
            <View
              key={store.id}
              className={classnames(
                styles.rankItem,
                store.id === myStoreId && styles.current
              )}
            >
              <Text
                className={classnames(
                  styles.rankNumber,
                  getRankClass(index + 1)
                )}
              >
                {index + 1}
              </Text>
              <View className={styles.storeInfo}>
                <Text className={styles.storeName}>{store.name}</Text>
                <Text className={styles.storeAddress}>{store.address}</Text>
              </View>
              <View className={styles.rankValue}>
                <Text className={styles.rankMainValue}>{getMainValue(store)}</Text>
                <Text
                  className={classnames(
                    styles.rankSubValue,
                    (rankType === 'sales'
                      ? store.todaySales >= store.yesterdaySales
                      : store.todayTraffic >= store.yesterdayTraffic)
                      ? styles.up
                      : styles.down
                  )}
                >
                  {rankType === 'completion'
                    ? '较昨日'
                    : getSubValue(store)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 巡店记录 */}
      <View className={styles.recordSection}>
        <SectionHeader
          title="巡店记录"
          extra="查看全部"
          showArrow
          onClickExtra={() => handleRecordClick('all')}
        />
        {inspectionRecords.slice(0, 2).map(record => (
          <View
            key={record.id}
            className={styles.recordCard}
            onClick={() => handleRecordClick(record.id)}
          >
            <View className={styles.recordHeader}>
              <Text className={styles.recordStore}>{record.storeName}</Text>
              <Text className={styles.recordDate}>{record.date}</Text>
            </View>
            <View className={styles.scoreRow}>
              <Text className={styles.scoreNum}>{record.score}</Text>
              <Text className={styles.scoreLabel}>分</Text>
            </View>
            <View className={styles.scoreItems}>
              {record.items.slice(0, 4).map(item => (
                <View key={item.name} className={styles.scoreItem}>
                  <Text className={styles.scoreItemName}>{item.name}</Text>
                  <Text className={styles.scoreItemValue}>{item.score}分</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: '160rpx' }} />

      {/* 分享按钮 */}
      <View className={styles.shareBtn} onClick={handleShare}>
        <Text className={styles.btnIcon}>📤</Text>
        <Text>分享巡店记录</Text>
      </View>
    </ScrollView>
  );
};

export default RankingPage;
