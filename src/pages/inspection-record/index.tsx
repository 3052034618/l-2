import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useInventoryStore } from '@/store/inventory';
import { useDisplayStore } from '@/store/display';
import { useTasksStore } from '@/store/tasks';
import { useReplenishmentStore } from '@/store/replenishment';

const InspectionRecordPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const stockRecords = useInventoryStore(state => state.stockRecords);
  const products = useInventoryStore(state => state.products);
  const displayRecords = useDisplayStore(state => state.records);
  const tasks = useTasksStore(state => state.tasks);
  const replenishmentOrders = useReplenishmentStore(state => state.orders);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const isToday = (timeStr: string) => {
    return timeStr && timeStr.startsWith(todayStr);
  };

  const reportData = useMemo(() => {
    // 今天的库存盘点记录
    const todayStockRecords = stockRecords.filter(r => isToday(r.createTime));
    const stockCheckCount = todayStockRecords.length;
    const lossCount = todayStockRecords.filter(r => r.type === 'loss').length;
    const profitCount = todayStockRecords.filter(r => r.type === 'profit').length;

    // 今天的补货申请
    const todayReplenishment = replenishmentOrders.filter(o => isToday(o.createTime));
    const replenishmentCount = todayReplenishment.length;
    const replenishmentItems = todayReplenishment.reduce((sum, o) => sum + o.items.length, 0);

    // 今天的陈列检查
    const todayDisplay = displayRecords.filter(r => isToday(r.createTime));
    const displayCount = todayDisplay.length;
    const abnormalCount = todayDisplay.filter(r => r.status === 'abnormal').length;
    const rectifiedCount = todayDisplay.filter(
      r => r.rectificationStatus === 'completed'
    ).length;

    // 今天的任务
    const todayTasks = tasks.filter(t => isToday(t.createTime));
    const totalTaskCount = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

    // 低库存商品数
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    return {
      stockCheckCount,
      lossCount,
      profitCount,
      replenishmentCount,
      replenishmentItems,
      displayCount,
      abnormalCount,
      rectifiedCount,
      totalTaskCount,
      completedTasks,
      pendingTasks,
      lowStockCount,
      outOfStockCount
    };
  }, [stockRecords, products, displayRecords, tasks, replenishmentOrders, todayStr]);

  const reportText = useMemo(() => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    return `【巡店日报】${dateStr}
━━━━━━━━━━━━━━━━
📦 库存盘点
  • 盘点记录：${reportData.stockCheckCount} 条
  • 报溢记录：${reportData.profitCount} 条
  • 报损记录：${reportData.lossCount} 条
  • 低库存商品：${reportData.lowStockCount} 个
  • 缺货商品：${reportData.outOfStockCount} 个

📋 补货申请
  • 申请单：${reportData.replenishmentCount} 单
  • 申请商品：${reportData.replenishmentItems} 种

🏪 陈列检查
  • 检查记录：${reportData.displayCount} 条
  • 异常记录：${reportData.abnormalCount} 条
  • 已整改：${reportData.rectifiedCount} 条

✅ 任务完成
  • 任务总数：${reportData.totalTaskCount} 个
  • 已完成：${reportData.completedTasks} 个
  • 待处理：${reportData.pendingTasks} 个
━━━━━━━━━━━━━━━━
报告人：店长
生成时间：${date.toLocaleString('zh-CN', { hour12: false })}`;
  }, [reportData]);

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

  return (
    <ScrollView className={styles.page} scrollY>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.headerTitle}>巡店日报</Text>
        <Text className={styles.headerDesc}>{todayStr} 门店运营情况汇总</Text>
      </View>

      {/* 库存盘点卡片 */}
      <View className={styles.sectionCard}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardIcon}>�</Text>
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

      <View style={{ height: '180rpx' }} />

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
