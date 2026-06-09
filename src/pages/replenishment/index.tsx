import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useReplenishmentStore, ReplenishmentItem, ReplenishmentOrder } from '@/store/replenishment';
import { useInventoryStore } from '@/store/inventory';

type TabType = 'list' | 'create';
type ListFilter = 'all' | 'pending' | 'approved' | 'completed';

const ReplenishmentPage: React.FC = () => {
  const { orders, createOrder, confirmReceive } = useReplenishmentStore();
  const { products } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [listFilter, setListFilter] = useState<ListFilter>('all');
  const [remark, setRemark] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());

  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ReplenishmentOrder | null>(null);
  const [receiveQuantities, setReceiveQuantities] = useState<Map<string, string>>(new Map());

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock < p.minStock);
  }, [products]);

  const filteredOrders = useMemo(() => {
    if (listFilter === 'all') return orders;
    return orders.filter(o => o.status === listFilter);
  }, [orders, listFilter]);

  const handleQtyChange = (productId: string, delta: number) => {
    const newSelected = new Map(selectedProducts);
    const currentQty = newSelected.get(productId) || 0;
    const newQty = Math.max(0, currentQty + delta);

    if (newQty === 0) {
      newSelected.delete(productId);
    } else {
      newSelected.set(productId, newQty);
    }

    setSelectedProducts(newSelected);
  };

  const selectedItems: ReplenishmentItem[] = useMemo(() => {
    const items: ReplenishmentItem[] = [];
    selectedProducts.forEach((qty, productId) => {
      const product = products.find(p => p.id === productId);
      if (product) {
        items.push({
          productId,
          productName: product.name,
          quantity: qty,
          unit: product.unit,
          price: product.price
        });
      }
    });
    return items;
  }, [selectedProducts, products]);

  const totalQuantity = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [selectedItems]);

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [selectedItems]);

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    createOrder(selectedItems, remark);
    Taro.showToast({ title: '申请已提交', icon: 'success' });
    setActiveTab('list');
    setSelectedProducts(new Map());
    setRemark('');
  };

  const handleOpenReceive = (order: ReplenishmentOrder) => {
    setCurrentOrder(order);
    const qtys = new Map<string, string>();
    order.items.forEach(item => {
      qtys.set(item.productId, String(item.quantity));
    });
    setReceiveQuantities(qtys);
    setReceiveModalVisible(true);
  };

  const handleReceiveQtyChange = (productId: string, value: string) => {
    const newQtys = new Map(receiveQuantities);
    newQtys.set(productId, value);
    setReceiveQuantities(newQtys);
  };

  const handleConfirmReceive = () => {
    if (!currentOrder) return;

    const receivedItems = currentOrder.items.map(item => ({
      productId: item.productId,
      receivedQty: parseInt(receiveQuantities.get(item.productId) || '0') || 0
    }));

    const hasValidQty = receivedItems.some(item => item.receivedQty > 0);
    if (!hasValidQty) {
      Taro.showToast({ title: '请输入到货数量', icon: 'none' });
      return;
    }

    confirmReceive(currentOrder.id, receivedItems);
    Taro.showToast({ title: '确认到货成功', icon: 'success' });
    setReceiveModalVisible(false);
    setCurrentOrder(null);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待审核',
      approved: '待收货',
      in_transit: '运输中',
      rejected: '已拒绝',
      completed: '已完成'
    };
    return map[status] || status;
  };

  const formatId = (id: string) => {
    return id.replace('order_', '').slice(0, 8).toUpperCase();
  };

  const filterOptions = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '待收货' },
    { key: 'completed', label: '已完成' }
  ];

  return (
    <View className={styles.page}>
      {/* Tab栏 */}
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'list' && styles.active)}
          onClick={() => setActiveTab('list')}
        >
          <Text>补货记录</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'create' && styles.active)}
          onClick={() => setActiveTab('create')}
        >
          <Text>新建申请</Text>
        </View>
      </View>

      {activeTab === 'list' ? (
        <>
          {/* 筛选栏 */}
          <ScrollView className={styles.filterBar} scrollX>
            {filterOptions.map(opt => (
              <View
                key={opt.key}
                className={classnames(
                  styles.filterItem,
                  listFilter === opt.key && styles.active
                )}
                onClick={() => setListFilter(opt.key as ListFilter)}
              >
                <Text>{opt.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* 申请记录 */}
          <ScrollView className={styles.orderList} scrollY>
            {filteredOrders.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📋</Text>
                <Text className={styles.emptyText}>暂无补货记录</Text>
              </View>
            ) : (
              filteredOrders.map(order => (
                <View key={order.id} className={styles.orderCard}>
                  <View className={styles.orderHeader}>
                    <Text className={styles.orderId}>
                      补货单 #{formatId(order.id)}
                    </Text>
                    <View className={classnames(styles.orderStatus, styles[order.status])}>
                      <Text>{getStatusText(order.status)}</Text>
                    </View>
                  </View>

                  <View className={styles.orderItems}>
                    {order.items.slice(0, 2).map(item => (
                      <View key={item.productId} className={styles.orderItem}>
                        <Text className={styles.orderItemName}>{item.productName}</Text>
                        <Text className={styles.orderItemQty}>
                          x{item.receivedQty !== undefined
                            ? `${item.receivedQty}/${item.quantity}`
                            : item.quantity
                          }{item.unit}
                        </Text>
                      </View>
                    ))}
                    {order.items.length > 2 && (
                      <Text style={{ fontSize: '22rpx', color: '#86909c', textAlign: 'center', paddingTop: '16rpx' }}>
                        共{order.items.length}种商品
                      </Text>
                    )}
                  </View>

                  <View className={styles.orderFooter}>
                    <Text className={styles.orderTime}>
                      {order.receiveTime ? `收货：${order.receiveTime}` : order.createTime}
                    </Text>
                    <Text className={styles.orderTotal}>¥{order.totalAmount.toFixed(2)}</Text>
                  </View>

                  {order.status === 'approved' && (
                    <View className={styles.orderAction}>
                      <View
                        className={styles.receiveBtn}
                        onClick={() => handleOpenReceive(order)}
                      >
                        <Text>确认到货</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        /* 新建申请 */
        <ScrollView className={styles.createForm} scrollY>
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>
              待补货商品 ({lowStockProducts.length}种)
            </Text>
            {lowStockProducts.length === 0 ? (
              <Text style={{ fontSize: '26rpx', color: '#86909c', textAlign: 'center', padding: '40rpx 0' }}>
                暂无缺货商品
              </Text>
            ) : (
              lowStockProducts.map(product => (
                <View key={product.id} className={styles.productSelector}>
                  <Image
                    className={styles.productSelectorImg}
                    src={product.image}
                    mode="aspectFill"
                  />
                  <View className={styles.productSelectorInfo}>
                    <Text className={styles.productSelectorName}>{product.name}</Text>
                    <Text className={styles.productSelectorPrice}>
                      ¥{product.price.toFixed(2)} / {product.unit}
                    </Text>
                  </View>
                  <View className={styles.qtyControl}>
                    <View
                      className={classnames(
                        styles.qtyBtn,
                        (selectedProducts.get(product.id) || 0) === 0 && styles.disabled
                      )}
                      onClick={() => handleQtyChange(product.id, -1)}
                    >
                      <Text>−</Text>
                    </View>
                    <Text className={styles.qtyValue}>
                      {selectedProducts.get(product.id) || 0}
                    </Text>
                    <View
                      className={styles.qtyBtn}
                      onClick={() => handleQtyChange(product.id, 1)}
                    >
                      <Text>+</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View className={styles.remarkSection}>
            <Text className={styles.sectionTitle}>备注</Text>
            <Input
              className={styles.remarkInput}
              placeholder="请输入备注信息..."
              value={remark}
              onInput={e => setRemark(e.detail.value)}
              maxlength={200}
            />
          </View>

          <View style={{ height: '200rpx' }} />
        </ScrollView>
      )}

      {/* 底部提交栏 */}
      {activeTab === 'create' && (
        <View className={styles.summaryBar}>
          <View className={styles.summaryInfo}>
            <Text className={styles.summaryLabel}>
              已选 {totalQuantity} 件商品
            </Text>
            <Text className={styles.summaryValue}>¥{totalAmount.toFixed(2)}</Text>
          </View>
          <View
            className={classnames(
              styles.submitBtn,
              selectedItems.length === 0 && styles.disabled
            )}
            onClick={handleSubmit}
          >
            <Text>提交申请</Text>
          </View>
        </View>
      )}

      {/* 到货确认弹窗 */}
      {receiveModalVisible && currentOrder && (
        <View className={styles.modalOverlay} onClick={() => setReceiveModalVisible(false)}>
          <View className={styles.receiveModal} onClick={e => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>确认到货</Text>
              <View className={styles.modalClose} onClick={() => setReceiveModalVisible(false)}>
                <Text>✕</Text>
              </View>
            </View>

            <ScrollView className={styles.receiveList} scrollY>
              {currentOrder.items.map(item => (
                <View key={item.productId} className={styles.receiveItem}>
                  <View className={styles.receiveItemInfo}>
                    <Text className={styles.receiveItemName}>{item.productName}</Text>
                    <Text className={styles.receiveItemExpect}>
                      申请：{item.quantity}{item.unit}
                    </Text>
                  </View>
                  <View className={styles.receiveInputWrap}>
                    <Input
                      className={styles.receiveInput}
                      type="number"
                      value={receiveQuantities.get(item.productId) || ''}
                      onInput={e => handleReceiveQtyChange(item.productId, e.detail.value)}
                    />
                    <Text className={styles.receiveUnit}>{item.unit}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className={styles.receiveBtns}>
              <View
                className={styles.cancelBtn}
                onClick={() => setReceiveModalVisible(false)}
              >
                <Text>取消</Text>
              </View>
              <View className={styles.confirmBtn} onClick={handleConfirmReceive}>
                <Text>确认收货</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReplenishmentPage;
