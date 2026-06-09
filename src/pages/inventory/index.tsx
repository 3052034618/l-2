import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Image, Button, Modal } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInventoryStore } from '@/store/inventory';
import { Product } from '@/types';

type TabType = 'all' | 'low' | 'out' | 'near';

const InventoryPage: React.FC = () => {
  const { products, getStats, updateStock } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [refreshing, setRefreshing] = useState(false);

  const [showScanModal, setShowScanModal] = useState(false);
  const [scanBarcode, setScanBarcode] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [actualStock, setActualStock] = useState('');

  const categories = ['全部', '饮料', '休闲零食', '方便食品', '乳制品', '烘焙食品'];

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'low', label: '低库存' },
    { key: 'out', label: '缺货' },
    { key: 'near', label: '临期' }
  ];

  const stats = useMemo(() => getStats(), [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

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
  }, [activeTab, searchText, activeCategory, products]);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 800);
  });

  const handleScan = () => {
    console.log('[Inventory] 调用扫码');
    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode', 'qrCode'],
      success: (res) => {
        console.log('[Inventory] 扫码成功:', res.result);
        const barcode = res.result;
        const product = products.find(p => p.barcode === barcode);

        if (product) {
          setScanBarcode(barcode);
          setMatchedProduct(product);
          setActualStock(String(product.stock));
          setShowScanModal(true);
        } else {
          Taro.showModal({
            title: '未找到商品',
            content: `条码 ${barcode} 未找到匹配商品`,
            showCancel: true,
            cancelText: '重新扫码',
            confirmText: '手动录入',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 手动录入
                setScanBarcode(barcode);
                setMatchedProduct(null);
                setActualStock('');
                setShowScanModal(true);
              } else if (modalRes.cancel) {
                // 重新扫码
                handleScan();
              }
            }
          });
        }
      },
      fail: (err) => {
        console.log('[Inventory] 扫码失败:', err);
        // 扫码取消或失败，只显示提示，不自动打开手输弹窗
        Taro.showToast({ title: '已取消扫码', icon: 'none' });
      }
    });
  };

  const handleBarcodeInput = (value: string) => {
    setScanBarcode(value);
    const product = products.find(p => p.barcode === value);
    if (product) {
      setMatchedProduct(product);
      setActualStock(String(product.stock));
    } else {
      setMatchedProduct(null);
    }
  };

  const handleQuickScan = (barcode: string) => {
    handleBarcodeInput(barcode);
  };

  const handleSaveStock = () => {
    if (!matchedProduct) {
      Taro.showToast({ title: '请先匹配商品', icon: 'none' });
      return;
    }
    const stock = parseInt(actualStock);
    if (isNaN(stock) || stock < 0) {
      Taro.showToast({ title: '请输入有效数量', icon: 'none' });
      return;
    }

    updateStock(matchedProduct.id, stock);
    Taro.showToast({ title: '盘点成功', icon: 'success' });
    setShowScanModal(false);
  };

  const handleProductClick = (productId: string) => {
    console.log('[Inventory] 点击商品:', productId);
    Taro.navigateTo({ url: `/pages/product-detail/index?id=${productId}` });
  };

  const handleLossProfit = () => {
    Taro.navigateTo({ url: '/pages/loss-profit/index' });
  };

  const handleLowStockSetting = () => {
    Taro.navigateTo({ url: '/pages/low-stock-setting/index' });
  };

  const handleReplenishment = () => {
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

  const quickBarcodes = products.slice(0, 4).map(p => p.barcode);

  return (
    <View className={styles.page}>
      {/* 搜索栏 */}
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
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

      {/* 扫码弹窗 */}
      <Modal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        className={styles.scanModal}
      >
        <View className={styles.scanModalContent}>
          <View className={styles.scanModalHeader}>
            <Text className={styles.scanModalTitle}>扫码盘点</Text>
            <View className={styles.scanModalClose} onClick={() => setShowScanModal(false)}>
              <Text>✕</Text>
            </View>
          </View>

          <View className={styles.scanInputWrap}>
            <Text className={styles.scanLabel}>商品条码</Text>
            <Input
              className={styles.scanInput}
              placeholder="输入或扫描商品条码"
              value={scanBarcode}
              onInput={e => handleBarcodeInput(e.detail.value)}
              type="number"
            />
          </View>

          <View className={styles.quickBarcodes}>
            <Text className={styles.quickLabel}>快速选择：</Text>
            {quickBarcodes.map(code => (
              <View
                key={code}
                className={styles.quickBarcodeTag}
                onClick={() => handleQuickScan(code)}
              >
                <Text>{code.slice(-4)}</Text>
              </View>
            ))}
          </View>

          {matchedProduct ? (
            <View className={styles.matchedProduct}>
              <Image
                className={styles.matchedImg}
                src={matchedProduct.image}
                mode="aspectFill"
              />
              <View className={styles.matchedInfo}>
                <Text className={styles.matchedName}>{matchedProduct.name}</Text>
                <Text className={styles.matchedCategory}>{matchedProduct.category}</Text>
                <Text className={styles.currentStock}>
                  当前库存：{matchedProduct.stock}{matchedProduct.unit}
                </Text>
              </View>
            </View>
          ) : scanBarcode ? (
            <View className={styles.noMatch}>
              <Text>未找到匹配的商品</Text>
            </View>
          ) : null}

          {matchedProduct && (
            <View className={styles.stockInputWrap}>
              <Text className={styles.scanLabel}>实盘数量</Text>
              <Input
                className={styles.stockInput}
                type="number"
                value={actualStock}
                onInput={e => setActualStock(e.detail.value)}
                placeholder="请输入实际库存数量"
              />
              <Text className={styles.stockUnit}>{matchedProduct.unit}</Text>
            </View>
          )}

          <View className={styles.scanModalBtns}>
            <View
              className={classnames(styles.scanBtnOutline, styles.cancelBtn)}
              onClick={() => setShowScanModal(false)}
            >
              <Text>取消</Text>
            </View>
            <View
              className={classnames(styles.scanBtnPrimary, !matchedProduct && styles.disabled)}
              onClick={handleSaveStock}
            >
              <Text>保存盘点</Text>
            </View>
          </View>
        </View>
      </Modal>

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
