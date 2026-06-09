import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import StatCard from '@/components/StatCard';
import ProductItem from '@/components/ProductItem';
import SectionHeader from '@/components/SectionHeader';
import {
  dashboardData,
  quickActions,
  salesTrendData
} from '@/data/dashboard';
import { useInventoryStore } from '@/store/inventory';
import { useTasksStore } from '@/store/tasks';
import { formatDate } from '@/utils';

const DashboardPage: React.FC = () => {
  const { products } = useInventoryStore();
  const { getPendingCount } = useTasksStore();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  }, []);

  usePullDownRefresh(handleRefresh);

  useDidShow(() => {
    console.log('[Dashboard] 页面显示');
  });

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => p.stock <= 0);
  }, [products]);

  const nearExpiryProducts = useMemo(() => {
    return products.filter(p => p.expireDate);
  }, [products]);

  const pendingTaskCount = getPendingCount();

  const handleActionClick = (page: string) => {
    console.log('[Dashboard] 点击快捷功能:', page);
    Taro.navigateTo({ url: page });
  };

  const handleProductClick = (productId: string) => {
    console.log('[Dashboard] 点击商品:', productId);
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const handleMoreClick = (type: string) => {
    console.log('[Dashboard] 查看更多:', type);
    if (type === 'outOfStock' || type === 'nearExpiry') {
      Taro.switchTab({ url: '/pages/inventory/index' });
    }
  };

  const maxSales = Math.max(...salesTrendData.map(item => item.sales));

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 顶部信息 */}
      <View className={styles.header}>
        <View className={styles.storeInfo}>
          <Text className={styles.storeName}>望京店</Text>
          <Text className={styles.storeDate}>{formatDate(new Date(), 'YYYY年MM月DD日')}</Text>
        </View>
        <View className={styles.avatar}>
          <Text>店</Text>
        </View>
      </View>

      {/* 数据卡片 */}
      <View className={styles.statsGrid}>
        <View className={styles.salesCard}>
          <Text className={styles.salesLabel}>今日销售额</Text>
          <View style={{ display: 'flex', alignItems: 'baseline' }}>
            <Text className={styles.salesValue}>¥{dashboardData.todaySales.toFixed(2)}</Text>
          </View>
          <View
            className={classnames(styles.salesGrowth, dashboardData.salesGrowth >= 0 ? 'up' : 'down')}
          >
            <Text>
              较昨日 {dashboardData.salesGrowth >= 0 ? '↑' : '↓'}{' '}
              {(Math.abs(dashboardData.salesGrowth) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        <StatCard
          title="今日客流"
          value={dashboardData.todayTraffic}
          unit="人"
          growth={dashboardData.trafficGrowth}
          color="success"
        />
        <StatCard
          title="待办任务"
          value={pendingTaskCount}
          unit="项"
          color="warning"
          onClick={() => Taro.switchTab({ url: '/pages/tasks/index' })}
        />
      </View>

      {/* 快捷功能 */}
      <View className={styles.quickActions}>
        <View className={styles.actionGrid}>
          {quickActions.map(action => (
            <View
              key={action.id}
              className={styles.actionItem}
              onClick={() => handleActionClick(action.page)}
            >
              <View
                className={styles.actionIcon}
                style={{ background: `${action.color}15`, color: action.color }}
              >
                <Text>{getActionIcon(action.icon)}</Text>
              </View>
              <Text className={styles.actionName}>{action.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 缺货商品 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Text className={styles.sectionTitle}>缺货商品</Text>
            <View className={styles.badge}>{outOfStockProducts.length}</View>
          </View>
          <Text className={styles.sectionMore} onClick={() => handleMoreClick('outOfStock')}>
            查看更多 ›
          </Text>
        </View>
        <View className={styles.productList}>
          {outOfStockProducts.slice(0, 3).map(product => (
            <ProductItem
              key={product.id}
              product={product}
              type="outOfStock"
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </View>
      </View>

      {/* 临期商品 */}
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Text className={styles.sectionTitle}>临期商品</Text>
            <View className={classnames(styles.badge, styles.warningBadge)}>
              {nearExpiryProducts.length}
            </View>
          </View>
          <Text className={styles.sectionMore} onClick={() => handleMoreClick('nearExpiry')}>
            查看更多 ›
          </Text>
        </View>
        <View className={styles.productList}>
          {nearExpiryProducts.slice(0, 3).map(product => (
            <ProductItem
              key={product.id}
              product={product}
              type="nearExpiry"
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </View>
      </View>

      {/* 销售趋势 */}
      <View className={styles.section}>
        <SectionHeader title="近7天销售趋势" />
        <View className={styles.chartContainer}>
          <View className={styles.chartBars}>
            {salesTrendData.map(item => (
              <View key={item.date} className={styles.chartBar}>
                <View
                  className={styles.bar}
                  style={{ height: `${(item.sales / maxSales) * 200}rpx` }}
                />
                <Text className={styles.barLabel}>{item.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

function getActionIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    scan: '📷',
    cart: '🛒',
    camera: '📸',
    report: '📋'
  };
  return iconMap[icon] || '📌';
}

export default DashboardPage;
