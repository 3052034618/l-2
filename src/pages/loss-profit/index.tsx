import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image, Input, Modal } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useInventoryStore } from '@/store/inventory';

type TabType = 'record' | 'register';
type FormType = 'loss' | 'profit';

const lossReasons = ['过期变质', '包装破损', '顾客退货', '其他'];
const profitReasons = ['盘盈', '补货多送', '其他'];

const LossProfitPage: React.FC = () => {
  const { stockRecords, products, addStockRecord } = useInventoryStore();

  const [activeTab, setActiveTab] = useState<TabType>('record');
  const [formType, setFormType] = useState<FormType>('loss');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  const filteredProducts = useMemo(() => {
    if (!searchKeyword) return products;
    return products.filter(p =>
      p.name.includes(searchKeyword) || p.barcode.includes(searchKeyword)
    );
  }, [products, searchKeyword]);

  const canSubmit = selectedProductId && parseInt(quantity) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const qty = parseInt(quantity);
    const reasonText = selectedTag || reason || (formType === 'loss' ? '报损' : '报溢');

    addStockRecord({
      productId: selectedProductId,
      productName: product.name,
      type: formType,
      quantity: qty,
      reason: reasonText
    });

    Taro.showToast({ title: '登记成功', icon: 'success' });
    setActiveTab('record');
    setSelectedProductId('');
    setQuantity('');
    setReason('');
    setSelectedTag('');
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setProductModalVisible(false);
    setSearchKeyword('');
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? '' : tag);
  };

  const tags = formType === 'loss' ? lossReasons : profitReasons;

  return (
    <View className={styles.page}>
      {/* Tab栏 */}
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'record' && styles.active)}
          onClick={() => setActiveTab('record')}
        >
          <Text>记录</Text>
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'register' && styles.active)}
          onClick={() => setActiveTab('register')}
        >
          <Text>登记</Text>
        </View>
      </View>

      {activeTab === 'record' ? (
        /* 记录列表 */
        <ScrollView className={styles.recordList} scrollY>
          {stockRecords.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>�</Text>
              <Text className={styles.emptyText}>暂无报损报溢记录</Text>
            </View>
          ) : (
            stockRecords.map(record => (
              <View key={record.id} className={styles.recordCard}>
                <View className={styles.recordHeader}>
                  <View className={styles.recordType}>
                    <View className={classnames(styles.recordTypeIcon, styles[record.type])}>
                      <Text>{record.type === 'loss' ? '↓' : '↑'}</Text>
                    </View>
                    <Text className={styles.recordTypeText}>
                      {record.type === 'loss' ? '报损' : '报溢'}
                    </Text>
                  </View>
                  <Text className={classnames(styles.recordQty, styles[record.type])}>
                    {record.type === 'loss' ? '-' : '+'}{record.quantity}
                  </Text>
                </View>

                <View className={styles.recordProduct}>
                  <Image
                    className={styles.recordProductImg}
                    src={products.find(p => p.id === record.productId)?.image || ''}
                    mode="aspectFill"
                  />
                  <View className={styles.recordProductInfo}>
                    <Text className={styles.recordProductName}>{record.productName}</Text>
                    <Text className={styles.recordProductSku}>
                      {products.find(p => p.id === record.productId)?.barcode || ''}
                    </Text>
                  </View>
                </View>

                <Text className={styles.recordReason}>原因：{record.reason}</Text>
                <Text className={styles.recordTime}>{record.createTime}</Text>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        /* 登记表单 */
        <ScrollView className={styles.formPage} scrollY>
          {/* 类型选择 */}
          <View className={styles.typeSelector}>
            <Text className={styles.sectionTitle}>类型</Text>
            <View className={styles.typeOptions}>
              <View
                className={classnames(
                  styles.typeOption,
                  formType === 'loss' && styles.lossActive
                )}
                onClick={() => { setFormType('loss'); setSelectedTag(''); }}
              >
                <Text className={styles.typeOptionIcon}>📉</Text>
                <Text className={classnames(
                  styles.typeOptionText,
                  formType === 'loss' && styles.lossActive
                )}>报损</Text>
              </View>
              <View
                className={classnames(
                  styles.typeOption,
                  formType === 'profit' && styles.profitActive
                )}
                onClick={() => { setFormType('profit'); setSelectedTag(''); }}
              >
                <Text className={styles.typeOptionIcon}>📈</Text>
                <Text className={classnames(
                  styles.typeOptionText,
                  formType === 'profit' && styles.profitActive
                )}>报溢</Text>
              </View>
            </View>
          </View>

          {/* 商品选择 */}
          <View className={styles.productSelector}>
            <Text className={styles.sectionTitle}>商品</Text>
            <View
              className={classnames(styles.productPicker, selectedProductId && styles.selected)}
              onClick={() => setProductModalVisible(true)}
            >
              {selectedProduct ? (
                <>
                  <Image
                    className={styles.productPickerImg}
                    src={selectedProduct.image}
                    mode="aspectFill"
                  />
                  <View className={styles.productPickerInfo}>
                    <Text className={styles.productPickerName}>{selectedProduct.name}</Text>
                    <Text className={styles.productPickerStock}>
                      当前库存：{selectedProduct.stock}{selectedProduct.unit}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={{ fontSize: '28rpx', color: '#86909c', flex: 1 }}>请选择商品</Text>
              )}
              <Text className={styles.productPickerArrow}>›</Text>
            </View>
          </View>

          {/* 数量 */}
          <View className={styles.qtyInputSection}>
            <Text className={styles.sectionTitle}>数量</Text>
            <View className={styles.qtyInputRow}>
              <Text className={styles.qtyLabel}>
                {formType === 'loss' ? '报损' : '报溢'}数量
              </Text>
              <View className={styles.qtyInputWrapper}>
                <Input
                  className={styles.qtyInput}
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onInput={e => setQuantity(e.detail.value)}
                />
                <Text className={styles.qtyUnit}>{selectedProduct?.unit || '件'}</Text>
              </View>
            </View>
          </View>

          {/* 原因 */}
          <View className={styles.reasonSection}>
            <Text className={styles.sectionTitle}>原因</Text>
            <View className={styles.reasonTags}>
              {tags.map(tag => (
                <View
                  key={tag}
                  className={classnames(styles.reasonTag, selectedTag === tag && styles.active)}
                  onClick={() => handleTagClick(tag)}
                >
                  <Text>{tag}</Text>
                </View>
              ))}
            </View>
            <Input
              className={styles.reasonInput}
              placeholder="详细说明（选填）..."
              value={reason}
              onInput={e => setReason(e.detail.value)}
              maxlength={200}
            />
          </View>

          <View style={{ height: '160rpx' }} />
        </ScrollView>
      )}

      {/* 底部提交按钮 */}
      {activeTab === 'register' && (
        <View className={styles.submitBar}>
          <View
            className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
            onClick={handleSubmit}
          >
            <Text>确认登记</Text>
          </View>
        </View>
      )}

      {/* 商品选择弹窗 */}
      <Modal
        visible={productModalVisible}
        onClose={() => setProductModalVisible(false)}
      >
        <View className={styles.productModal}>
          <View className={styles.productModalHeader}>
            <Text className={styles.productModalTitle}>选择商品</Text>
            <View
              className={styles.productModalClose}
              onClick={() => setProductModalVisible(false)}
            >
              <Text>✕</Text>
            </View>
          </View>

          <View className={styles.productSearch}>
            <Input
              className={styles.searchInput}
              placeholder="搜索商品名称或条码"
              value={searchKeyword}
              onInput={e => setSearchKeyword(e.detail.value)}
            />
          </View>

          <ScrollView className={styles.productList} scrollY>
            {filteredProducts.map(product => (
              <View
                key={product.id}
                className={styles.productItem}
                onClick={() => handleSelectProduct(product.id)}
              >
                <Image
                  className={styles.productItemImg}
                  src={product.image}
                  mode="aspectFill"
                />
                <View className={styles.productItemInfo}>
                  <Text className={styles.productItemName}>{product.name}</Text>
                  <Text className={styles.productItemStock}>
                    库存：{product.stock}{product.unit}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default LossProfitPage;
