import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useInventoryStore } from '@/store/inventory';
import { useDisplayStore } from '@/store/display';
import { useTasksStore } from '@/store/tasks';
import { useReplenishmentStore } from '@/store/replenishment';

const storeInfo = {
  id: 'store_001',
  name: '便利店-望京SOHO店',
  address: '北京市朝阳区望京SOHO T1'
};

const InspectionRecordPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const stockRecords = useInventoryStore(state => state.stockRecords);
  const products = useInventoryStore(state => state.products);
  const displayRecords = useDisplayStore(state => state.records);
  const tasks = useTasksStore(state => state.tasks);
  const replenishmentOrders = useReplenishmentStore(state => state.orders);

  useDidShow(() => {
    console.log('[InspectionRecord] 页面显示，确保数据最新');
  });

  const isSelectedDate = (timeStr: string) => {
    return timeStr && timeStr.startsWith(selectedDate);
  };

  const dateDisplay = useMemo(() => {
    const d = new Date(selectedDate);
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
  }, [selectedDate]);

  const reportData = useMemo(() => {
    // 所选日期的库存盘点记录
    const dayStockRecords = stockRecords.filter(r => isSelectedDate(r.createTime));
    const stockCheckCount = dayStockRecords.length;
    const lossCount = dayStockRecords.filter(r => r.type === 'loss').length;
    const profitCount = dayStockRecords.filter(r => r.type === 'profit').length;
    const replenishmentArrivedCount = dayStockRecords.filter(r => r.reason === '补货到货').length;

    // 所选日期的补货申请
    const dayReplenishment = replenishmentOrders.filter(o => isSelectedDate(o.createTime));
    const replenishmentCount = dayReplenishment.length;
    const replenishmentItems = dayReplenishment.reduce((sum, o) => sum + o.items.length, 0);
    const replenishmentQty = dayReplenishment.reduce((sum, o) => {
      const arrived = o.items.reduce((s, item) => s + (item.receivedQty || 0), 0);
      return sum + arrived;
    }, 0);

    // 所选日期的陈列检查
    const dayDisplay = displayRecords.filter(r => isSelectedDate(r.createTime));
    const displayCount = dayDisplay.length;
    const abnormalCount = dayDisplay.filter(r => r.status === 'abnormal').length;
    const rectifiedCount = dayDisplay.filter(
      r => r.rectificationStatus === 'completed'
    ).length;

    // 截止到所选日期的任务累计
    const dayTasks = tasks.filter(t => isSelectedDate(t.createTime));
    const newTaskCount = dayTasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
    const totalTaskCount = tasks.length;

    // 当前缺货/低库存商品（实时状态）
    const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const lowStockCount = lowStockProducts.length;
    const outOfStockCount = outOfStockProducts.length;

    // 未整改的陈列异常
    const unrectifiedRecords = displayRecords.filter(
      r => r.status === 'abnormal' && r.rectificationStatus !== 'completed'
    );

    // 未完成的任务
    const unfinishedTasks = tasks.filter(t => t.status !== 'completed');

    return {
      stockCheckCount,
      lossCount,
      profitCount,
      replenishmentArrivedCount,
      replenishmentCount,
      replenishmentItems,
      replenishmentQty,
      displayCount,
      abnormalCount,
      rectifiedCount,
      newTaskCount,
      totalTaskCount,
      completedTasks,
      pendingTasks,
      lowStockCount,
      outOfStockCount,
      lowStockProducts,
      outOfStockProducts,
      unrectifiedRecords,
      unfinishedTasks
    };
  }, [stockRecords, products, displayRecords, tasks, replenishmentOrders, selectedDate]);

  const reportText = useMemo(() => {
    return `【巡店日报】${dateDisplay}
门店：${storeInfo.name}
━━━━━━━━━━━━━━━━
📦 库存盘点
  • 盘点记录：${reportData.stockCheckCount} 条
  • 报溢记录：${reportData.profitCount} 条
  • 报损记录：${reportData.lossCount} 条
  • 补货到货：${reportData.replenishmentArrivedCount} 条
  • 低库存商品：${reportData.lowStockCount} 个
  • 缺货商品：${reportData.outOfStockCount} 个

📋 补货申请
  • 新增申请单：${reportData.replenishmentCount} 单
  • 申请商品：${reportData.replenishmentItems} 种

🏪 陈列检查
  • 检查记录：${reportData.displayCount} 条
  • 异常记录：${reportData.abnormalCount} 条
  • 已整改：${reportData.rectifiedCount} 条
  • 待整改：${reportData.unrectifiedRecords.length} 条

✅ 任务完成
  • 新增任务：${reportData.newTaskCount} 个
  • 任务总数：${reportData.totalTaskCount} 个
  • 已完成：${reportData.completedTasks} 个
  • 待处理：${reportData.pendingTasks} 个

⚠️ 异常追踪
  • 待整改陈列：${reportData.unrectifiedRecords.length} 项
  • 未完成任务：${reportData.unfinishedTasks.length} 项
  • 缺货商品：${reportData.outOfStockCount} 个
━━━━━━━━━━━━━━━━
报告人：店长
生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`;
  }, [reportData, dateDisplay]);

  const handleDateChange = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(newDate);
  };

  const handleCopy = () => {
    Taro.setClipboardData({
      data: reportText,
      success: () => {
        setCopied(true);
        Taro.showToast({ title: '日报已复制', icon: 'success' });
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      success: () => {
        Taro.showToast({ title: '请点击右上角分享', icon: 'none' });
      }
    });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleProductClick = (productId: string) => {
    Taro.navigateTo({
      url: `/pages/product-detail/index?id=${productId}`
    });
  };

  const handleTaskClick = (taskId: string) => {
    Taro.navigateTo({
      url: `/pages/task-detail/index?id=${taskId}`
    });
  };

  const handleDisplayRectify = (recordId: string) => {
    Taro.switchTab({
      url: '/pages/display/index'
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>巡店日报</Text>
        <View className={styles.storeInfo}>
          <Text className={styles.storeName}>🏪 {storeInfo.name}</Text>
        </View>

        {/* 日期选择器 */}
        <View className={styles.dateSelector}>
          <View
            className={styles.dateArrow}
            onClick={() => handleDateChange(-1)}
          >
            <Text>‹</Text>
          </View>
          <View className={styles.dateDisplay}>
            <Text className={styles.dateText}>{dateDisplay}</Text>
          </View>
          <View
            className={styles.dateArrow}
            onClick={() => handleDateChange(1)}
          >
            <Text>›</Text>
          </View>
        </View>
      </View>

      {/* 库存盘点卡片 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>📦</Text>
          <Text className={styles.cardTitle}>库存盘点</Text>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{reportData.stockCheckCount}</Text>
            <Text className={styles.statLabel}>盘点记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#f53f3f' }}>
              {reportData.lossCount}
            </Text>
            <Text className={styles.statLabel}>报损</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#00b42a' }}>
              {reportData.profitCount}
            </Text>
            <Text className={styles.statLabel}>报溢</Text>
          </View>
        </View>
        <View className={styles.subStats}>
          <Text className={styles.subStat}>
            低库存商品：<Text style={{ color: '#ff7d00' }}>{reportData.lowStockCount}</Text> 个
          </Text>
          <Text className={styles.subStat}>
            缺货商品：<Text style={{ color: '#f53f3f' }}>{reportData.outOfStockCount}</Text> 个
          </Text>
        </View>
      </View>

      {/* 补货申请卡片 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>📋</Text>
          <Text className={styles.cardTitle}>补货申请</Text>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{reportData.replenishmentCount}</Text>
            <Text className={styles.statLabel}>申请单</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{reportData.replenishmentItems}</Text>
            <Text className={styles.statLabel}>商品种类</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#00b42a' }}>
              {reportData.replenishmentQty}
            </Text>
            <Text className={styles.statLabel}>实际到货</Text>
          </View>
        </View>
      </View>

      {/* 陈列检查卡片 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>🏪</Text>
          <Text className={styles.cardTitle}>陈列检查</Text>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{reportData.displayCount}</Text>
            <Text className={styles.statLabel}>检查记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#f53f3f' }}>
              {reportData.abnormalCount}
            </Text>
            <Text className={styles.statLabel}>异常</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#00b42a' }}>
              {reportData.rectifiedCount}
            </Text>
            <Text className={styles.statLabel}>已整改</Text>
          </View>
        </View>
      </View>

      {/* 任务完成卡片 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>✅</Text>
          <Text className={styles.cardTitle}>任务完成</Text>
        </View>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{reportData.totalTaskCount}</Text>
            <Text className={styles.statLabel}>任务总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#00b42a' }}>
              {reportData.completedTasks}
            </Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum} style={{ color: '#ff7d00' }}>
              {reportData.pendingTasks}
            </Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
        </View>
      </View>

      {/* 异常追踪区 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>⚠️</Text>
          <Text className={styles.cardTitle}>异常追踪</Text>
        </View>

        {/* 待整改陈列 */}
        {reportData.unrectifiedRecords.length > 0 && (
          <View className={styles.trackSection}>
            <Text className={styles.trackLabel}>📌 待整改陈列 ({reportData.unrectifiedRecords.length})</Text>
            <View className={styles.trackList}>
              {reportData.unrectifiedRecords.slice(0, 3).map(record => (
                <View
                  key={record.id}
                  className={styles.trackItem}
                  onClick={() => handleDisplayRectify(record.id)}
                >
                  <Text className={styles.trackItemTitle}>{record.shelfName}</Text>
                  <Text className={styles.trackItemArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 未完成任务 */}
        {reportData.unfinishedTasks.length > 0 && (
          <View className={styles.trackSection}>
            <Text className={styles.trackLabel}>📋 未完成任务 ({reportData.unfinishedTasks.length})</Text>
            <View className={styles.trackList}>
              {reportData.unfinishedTasks.slice(0, 3).map(task => (
                <View
                  key={task.id}
                  className={styles.trackItem}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <View className={styles.trackItemInfo}>
                    <Text className={styles.trackItemTitle}>{task.title}</Text>
                    <Text className={styles.trackItemSub}>进度 {task.progress || 0}%</Text>
                  </View>
                  <Text className={styles.trackItemArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 缺货商品 */}
        {reportData.outOfStockProducts.length > 0 && (
          <View className={styles.trackSection}>
          <Text className={styles.trackLabel}>📦 缺货商品 ({reportData.outOfStockProducts.length})</Text>
            <View className={styles.trackList}>
              {reportData.outOfStockProducts.slice(0, 3).map(product => (
                <View
                  key={product.id}
                  className={styles.trackItem}
                  onClick={() => handleProductClick(product.id)}
                >
                  <View className={styles.trackItemInfo}>
                    <Text className={styles.trackItemTitle}>{product.name}</Text>
                    <Text className={styles.trackItemSub}>{product.category}</Text>
                  </View>
                  <Text className={styles.trackItemArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {reportData.unrectifiedRecords.length === 0 &&
          reportData.unfinishedTasks.length === 0 &&
          reportData.outOfStockProducts.length === 0 && (
            <View className={styles.emptyTrack}>
              <Text className={styles.emptyTrackText}>🎉 今日无异常，继续保持！</Text>
            </View>
          )}
      </View>

      {/* 日报文本预览 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>📝</Text>
          <Text className={styles.cardTitle}>日报内容</Text>
        </View>
        <View className={styles.reportPreview}>
          <Text className={styles.reportText}>{reportText}</Text>
        </View>
      </View>

      <View style={{ height: '200rpx' }} />

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.btnOutline} onClick={handleBack}>
          <Text>返回</Text>
        </View>
        <View className={styles.btnSecondary} onClick={handleCopy}>
          <Text>{copied ? '已复制' : '复制日报'}</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleShare}>
          <Text>分享日报</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default InspectionRecordPage;
