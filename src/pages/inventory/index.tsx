import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { inventoryList } from '@/data/inventory';

type TabType = 'all' | 'low' | 'out' | 'near';

const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['全部', '饮料', '休闲零食', '方便食品', '乳制品', '烘焙食品'];

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'low', label: '低库存' },
    { key: 'out', label: '缺货' },
    { key: 'near', label: '临期' }
  ];

  const stats = useMemo(() => {
    const total = inventoryList.length;
    const low = inventoryList.filter(p => p.stock > 0 && p.stock < p.minStock).length;
    const out = inventoryList.filter(p => p.stock <= 0).length;
    const near = inventoryList.filter(p => p.expireDate).length;
    return { total, low, out, near };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...inventoryList];

    if (activeCategory !== '全部') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchText) {
      const keyword = searchText.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(keyword) || p.barcode.includes(keyword)
      );
    }

    switch (activeTab) {
      case 'low':
        result = result.filter(p => p.stock > 0 && p.stock < p.minStock);
        break;
      case 'out':
        result = result.filter(p => p.stock <= 0);
        break;
      case 'near':
        result = result.filter(p => p.expireDate);
        break;
    }

    return result;
  }, [activeTab, searchText, activeCategory]);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const handleScan = () => {
    console.log('[Inventory] 点击扫码');
    Taro.showToast({ title: '扫码功能', icon: 'none' });
  };

  const handleProductClick = (productId: string) => {
    console.log('[Inventory] 点击商品:', productId);
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const handleLossProfit = () => {
    console.log('[Inventory] 报损报溢');
    Taro.navigateTo({ url: '/pages/loss-profit/index' });
  };

  const handleLowStockSetting = () => {
    console.log('[Inventory] 低库存设置');
    Taro.navigateTo({ url: '/pages/low-stock-setting/index' });
  };

  const handleReplenishment = () => {
    console.log('[Inventory] 补货申请');
    Taro.navigateTo({ url: '/pages/replenishment/index' });
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return 'out';
    if (stock < minStock) return 'low';
    return 'normal';
  };

  const getStockText = (stock: number, minStock: number) => {
    if (stock <= 0) return '缺货';
    if (stock < minStock) return '库存不足';
    return '库存充足';
  };

  return (
    <View className={styles.page}>
      {/* 搜索栏 */}
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchText}
            placeholder="搜索商品名称/条码"
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
          />
        </View>
        <View className={styles.scanBtn} onClick={handleScan}>
          <Text>📷</Text>
        </View>
      </View>

      {/* 分类筛选 */}
      <ScrollView className={styles.categoryFilter} scrollX>
        {categories.map(cat => (
          <View
            key={cat}
            className={classnames(styles.categoryItem, activeCategory === cat && styles.active)}
            onClick={() => setActiveCategory(cat)}
          >
            <Text>{cat}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 统计概览 */}
      <View className={styles.statsRow}>
        <View className={classnames(styles.statItem, styles.info)}>
          <Text className={styles.statValue}>{stats.total}</Text>
          <Text className={styles.statLabel}>总SKU</Text>
        </View>
        <View className={classnames(styles.statItem, styles.warning)}>
          <Text className={styles.statValue}>{stats.low}</Text>
          <Text className={styles.statLabel}>低库存</Text>
        </View>
        <View className={classnames(styles.statItem, styles.danger)}>
          <Text className={styles.statValue}>{stats.out}</Text>
          <Text className={styles.statLabel}>缺货</Text>
        </View>
        <View className={classnames(styles.statItem, styles.warning)}>
          <Text className={styles.statValue}>{stats.near}</Text>
          <Text className={styles.statLabel}>临期</Text>
        </View>
      </View>

      {/* Tab切换 */}
      <View className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key as TabType)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 商品列表 */}
      <ScrollView className={styles.productList} scrollY>
        {filteredProducts.length === 0 ? (
          <View style={{ textAlign: 'center', padding: '80rpx 0', color: '#86909c' }}>
            <Text>暂无商品数据</Text>
          </View>
        ) : (
          filteredProducts.map(product => (
            <View
              key={product.id}
              className={styles.productCard}
              onClick={() => handleProductClick(product.id)}
            >
              <View className={styles.productRow}>
                <Image
                  className={styles.productImg}
                  src={product.image}
                  mode="aspectFill"
                />
                <View className={styles.productInfo}>
                  <Text className={styles.productName}>{product.name}</Text>
                  <Text className={styles.productBarcode}>条码: {product.barcode}</Text>
                  <View className={styles.productBottom}>
                    <Text className={styles.productPrice}>¥{product.price.toFixed(2)}</Text>
                    <View className={styles.stockInfo}>
                      <View
                        className={classnames(
                          styles.stockTag,
                          styles[getStockStatus(product.stock, product.minStock)]
                        )}
                      >
                        <Text>{getStockText(product.stock, product.minStock)}</Text>
                      </View>
                      <Text className={styles.salesInfo}>
                        库存: {product.stock}{product.unit}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.bottomBtn} onClick={handleLossProfit}>
          <Text className={styles.bottomBtnIcon}>📋</Text>
          <Text className={styles.bottomBtnText}>报损报溢</Text>
        </View>
        <View className={styles.bottomBtn} onClick={handleLowStockSetting}>
          <Text className={styles.bottomBtnIcon}>⚙️</Text>
          <Text className={styles.bottomBtnText}>库存设置</Text>
        </View>
        <View
          className={classnames(styles.bottomBtn, styles.primaryBtn)}
          onClick={handleReplenishment}
        >
          <Text className={styles.bottomBtnIcon}>🛒</Text>
          <Text className={styles.bottomBtnText}>补货申请</Text>
        </View>
      </View>
    </View>
  );
};

export default InventoryPage;
