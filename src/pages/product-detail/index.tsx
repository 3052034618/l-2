import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInventoryStore } from '@/store/inventory';

type ChartType = 'sales' | 'stock';

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { getProductById, stockRecords, salesTrend } = useInventoryStore();

  const productId = router.params.id || '';
  const product = useMemo(() => getProductById(productId), [productId, getProductById]);
  const [chartType, setChartType] = useState<ChartType>('sales');

  useEffect(() => {
    if (product) {
      Taro.setNavigationBarTitle({ title: product.name });
    }
  }, [product]);

  const productRecords = useMemo(() => {
    return stockRecords
      .filter(r => r.productId === productId)
      .slice(0, 10);
  }, [stockRecords, productId]);

  const productSalesTrend = useMemo(() => {
    if (!product) return salesTrend;
    const baseVolume = product.salesVolume || 100;
    return salesTrend.map(item => ({
      ...item,
      volume: Math.round(baseVolume * (0.7 + Math.random() * 0.6)),
      sales: Math.round(baseVolume * (product.price || 1) * (0.7 + Math.random() * 0.6))
    }));
  }, [salesTrend, product]);

  const stockTrend = useMemo(() => {
    if (!product) return [];
    const days = ['', '', '', '', '', '', ''];
    let currentStock = product.stock + Math.floor(Math.random() * 20);
    return days.map((_, i) => {
      const change = Math.floor(Math.random() * 10) - 3;
      currentStock = Math.max(0, currentStock - change);
      return {
        date: `${i + 1}`,
        value: currentStock
      };
    });
  }, [product]);

  const chartData = chartType === 'sales' ? productSalesTrend : stockTrend;
  const maxValue = useMemo(() => {
    if (chartData.length === 0) return 100;
    const values = chartType === 'sales'
      ? (chartData as { volume: number }[]).map(d => d.volume)
      : (chartData as { value: number }[]).map(d => d.value);
    return Math.max(...values) * 1.2;
  }, [chartData, chartType]);

  const getStockStatus = () => {
    if (!product) return { text: '未知', className: 'normal' };
    if (product.stock <= 0) return { text: '缺货', className: 'out' };
    if (product.stock < product.minStock) return { text: '低库存', className: 'low' };
    return { text: '正常', className: 'normal' };
  };

  const stockStatus = getStockStatus();

  if (!product) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState} style={{ paddingTop: '160rpx' }}>
          <Text className={styles.emptyIcon}>📦</Text>
          <Text className={styles.emptyText}>商品不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 商品头部 */}
      <View className={styles.productHeader}>
        <Image
          className={styles.productImg}
          src={product.image}
          mode="aspectFill"
        />
        <View className={styles.productInfo}>
          <Text className={styles.productName}>{product.name}</Text>
          <Text className={styles.productPrice}>
            ¥{product.price.toFixed(2)}
            <Text className={styles.unit}>/{product.unit}</Text>
          </Text>
          <Text className={styles.productBarcode}>条码：{product.barcode}</Text>
        </View>
      </View>

      <ScrollView scrollY>
        {/* 库存卡片 */}
        <View className={styles.stockCard}>
          <Text className={styles.stockTitle}>库存信息</Text>
          <View className={styles.stockRow}>
            <Text className={styles.stockLabel}>当前库存</Text>
            <Text className={styles.stockValue}>
              {product.stock}{product.unit}
            </Text>
          </View>
          <View className={styles.stockRow}>
            <Text className={styles.stockLabel}>低库存阈值</Text>
            <Text className={styles.stockValue}>
              {product.minStock}{product.unit}
            </Text>
          </View>
          <View className={styles.stockRow}>
            <Text className={styles.stockLabel}>库存状态</Text>
            <Text className={classnames(
              styles.stockValue,
              styles.stockStatus,
              styles[stockStatus.className]
            )}>
              {stockStatus.text}
            </Text>
          </View>
          {product.expireDate && (
            <View className={styles.stockRow}>
              <Text className={styles.stockLabel}>保质期至</Text>
              <Text className={styles.stockValue}>{product.expireDate}</Text>
            </View>
          )}
        </View>

        {/* 销量趋势 */}
        <View className={styles.chartCard}>
          <Text className={styles.chartTitle}>数据趋势</Text>
          <View className={styles.chartTabs}>
            <View
              className={classnames(styles.chartTab, chartType === 'sales' && styles.active)}
              onClick={() => setChartType('sales')}
            >
              <Text>近7天销量</Text>
            </View>
            <View
              className={classnames(styles.chartTab, chartType === 'stock' && styles.active)}
              onClick={() => setChartType('stock')}
            >
              <Text>库存变化</Text>
            </View>
          </View>

          <View className={styles.chartContainer}>
            <View className={styles.barChart}>
              {chartData.map((item, index) => {
                const value = chartType === 'sales'
                  ? (item as { volume: number }).volume
                  : (item as { value: number }).value;
                const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;

                return (
                  <View key={index} className={styles.barGroup}>
                    <View
                      className={styles.bar}
                      style={{ height: `${Math.max(heightPercent, 1)}%` }}
                    >
                      <Text className={styles.barValue}>{value}</Text>
                    </View>
                    <Text className={styles.barLabel}>
                      {chartType === 'sales' ? (item as { date: string }).date.slice(5) : `${item.date}日`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 库存变化记录 */}
        <View className={styles.recordCard}>
          <Text className={styles.recordTitle}>库存变化记录</Text>
          {productRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无记录</Text>
            </View>
          ) : (
            productRecords.map(record => (
              <View key={record.id} className={styles.recordItem}>
                <View className={classnames(styles.recordType, styles[record.type])}>
                  <Text>{record.type === 'loss' ? '−' : '+'}</Text>
                </View>
                <View className={styles.recordInfo}>
                  <Text className={styles.recordReason}>{record.reason}</Text>
                  <Text className={styles.recordTime}>{record.createTime}</Text>
                </View>
                <Text className={classnames(styles.recordQty, styles[record.type])}>
                  {record.type === 'loss' ? '-' : '+'}{record.quantity}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: '40rpx' }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.btnOutline} onClick={() => Taro.navigateBack()}>
          <Text>返回</Text>
        </View>
        <View
          className={styles.btnPrimary}
          onClick={() => {
            Taro.navigateTo({
              url: '/pages/replenishment/index'
            });
          }}
        >
          <Text>申请补货</Text>
        </View>
      </View>
    </View>
  );
};

export default ProductDetailPage;
