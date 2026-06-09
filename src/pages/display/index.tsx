import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Modal, Input } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useDisplayStore } from '@/store/display';
import SectionHeader from '@/components/SectionHeader';

const DisplayPage: React.FC = () => {
  const { shelves, records, addRecord, updateShelfStatus } = useDisplayStore();

  const [refreshing, setRefreshing] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>(['1', '2', '3']);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedShelf, setSelectedShelf] = useState('');
  const [recordRemark, setRecordRemark] = useState('');
  const [recordStatus, setRecordStatus] = useState<'normal' | 'abnormal'>('normal');

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 800);
  });

  useDidShow(() => {
    console.log('[Display] 页面显示');
  });

  const stats = {
    total: shelves.length,
    checked: shelves.filter(s => s.status === 'checked').length,
    abnormal: shelves.filter(s => s.status === 'abnormal').length
  };

  const handleTakePhoto = () => {
    setShowRecordModal(true);
    setSelectedImages([]);
    setSelectedShelf('');
    setRecordRemark('');
    setRecordStatus('normal');
  };

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9 - selectedImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('[Display] 选择图片:', res.tempFilePaths);
        setSelectedImages([...selectedImages, ...res.tempFilePaths]);
      },
      fail: (err) => {
        console.warn('[Display] 选择图片失败，使用模拟图片', err);
        const mockImages = [
          `https://picsum.photos/id/${200 + Math.floor(Math.random() * 100)}/400/300`,
          `https://picsum.photos/id/${300 + Math.floor(Math.random() * 100)}/400/300`
        ];
        setSelectedImages([...selectedImages, ...mockImages]);
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleSaveRecord = () => {
    if (selectedImages.length === 0) {
      Taro.showToast({ title: '请先上传照片', icon: 'none' });
      return;
    }
    if (!selectedShelf) {
      Taro.showToast({ title: '请选择货架区域', icon: 'none' });
      return;
    }

    const shelf = shelves.find(s => s.id === selectedShelf);
    if (!shelf) return;

    addRecord({
      shelfName: shelf.name,
      images: selectedImages,
      status: recordStatus,
      remark: recordRemark
    });

    updateShelfStatus(selectedShelf, recordStatus === 'normal' ? 'checked' : 'abnormal');

    Taro.showToast({ title: '记录已保存', icon: 'success' });
    setShowRecordModal(false);
  };

  const handleShelfClick = (shelfId: string) => {
    setSelectedShelf(shelfId);
    const shelf = shelves.find(s => s.id === shelfId);
    if (shelf) {
      Taro.showToast({ title: `已选择: ${shelf.name}`, icon: 'none' });
    }
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
          {shelves.map(shelf => (
            <View
              key={shelf.id}
              className={styles.shelfCard}
              onClick={() => handleShelfClick(shelf.id)}
            >
              <View className={classnames(styles.shelfStatus, styles[shelf.status])}>
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
          {[
            { id: '1', name: '商品陈列整齐', required: true },
            { id: '2', name: '价签清晰完整', required: true },
            { id: '3', name: '商品正面朝外', required: true },
            { id: '4', name: '先进先出原则', required: true },
            { id: '5', name: '促销标识正确', required: false },
            { id: '6', name: '货架清洁卫生', required: true }
          ].map(item => (
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
          {records.slice(0, 3).map(record => (
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

      {/* 记录弹窗 */}
      <Modal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        className={styles.recordModal}
      >
        <View className={styles.recordModalContent}>
          <View className={styles.recordModalHeader}>
            <Text className={styles.recordModalTitle}>记录陈列</Text>
            <View className={styles.recordModalClose} onClick={() => setShowRecordModal(false)}>
              <Text>✕</Text>
            </View>
          </View>

          {/* 图片上传 */}
          <View className={styles.uploadSection}>
            <Text className={styles.uploadLabel}>陈列照片</Text>
            <View className={styles.imageGrid}>
              {selectedImages.map((img, idx) => (
                <View key={idx} className={styles.imageItem}>
                  <Image
                    className={styles.imagePreview}
                    src={img}
                    mode="aspectFill"
                  />
                  <View
                    className={styles.imageRemove}
                    onClick={() => removeImage(idx)}
                  >
                    <Text>✕</Text>
                  </View>
                </View>
              ))}
              {selectedImages.length < 9 && (
                <View className={styles.imageAdd} onClick={handleChooseImage}>
                  <Text className={styles.imageAddIcon}>➕</Text>
                  <Text className={styles.imageAddText}>添加照片</Text>
                </View>
              )}
            </View>
          </View>

          {/* 货架选择 */}
          <View className={styles.shelfSelectSection}>
            <Text className={styles.uploadLabel}>货架区域</Text>
            <ScrollView className={styles.shelfSelectList} scrollX>
              {shelves.map(shelf => (
                <View
                  key={shelf.id}
                  className={classnames(
                    styles.shelfSelectItem,
                    selectedShelf === shelf.id && styles.active
                  )}
                  onClick={() => setSelectedShelf(shelf.id)}
                >
                  <Text>{shelf.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 状态选择 */}
          <View className={styles.statusSection}>
            <Text className={styles.uploadLabel}>检查状态</Text>
            <View className={styles.statusOptions}>
              <View
                className={classnames(
                  styles.statusOption,
                  recordStatus === 'normal' && styles.normalActive
                )}
                onClick={() => setRecordStatus('normal')}
              >
                <Text>✓ 正常</Text>
              </View>
              <View
                className={classnames(
                  styles.statusOption,
                  recordStatus === 'abnormal' && styles.abnormalActive
                )}
                onClick={() => setRecordStatus('abnormal')}
              >
                <Text>⚠ 异常</Text>
              </View>
            </View>
          </View>

          {/* 备注 */}
          <View className={styles.remarkSection}>
            <Text className={styles.uploadLabel}>备注</Text>
            <Input
              className={styles.remarkInput}
              placeholder="请输入备注信息..."
              value={recordRemark}
              onInput={e => setRecordRemark(e.detail.value)}
              maxlength={200}
            />
          </View>

          <View className={styles.recordModalBtns}>
            <View
              className={classnames(styles.scanBtnOutline, styles.cancelBtn)}
              onClick={() => setShowRecordModal(false)}
            >
              <Text>取消</Text>
            </View>
            <View
              className={styles.scanBtnPrimary}
              onClick={handleSaveRecord}
            >
              <Text>保存记录</Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default DisplayPage;
