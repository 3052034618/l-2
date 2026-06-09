import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useTasksStore } from '@/store/tasks';

const TaskDetailPage: React.FC = () => {
  const router = useRouter();
  const taskId = router.params.id || '';

  const task = useTasksStore(state =>
    state.tasks.find(t => t.id === taskId)
  );
  const toggleTaskItem = useTasksStore(state => state.toggleTaskItem);

  useEffect(() => {
    if (task) {
      Taro.setNavigationBarTitle({ title: task.title });
    }
  }, [task?.title, task?.id]);

  const handleToggle = (itemId: string) => {
    if (!taskId) return;
    toggleTaskItem(taskId, itemId);
  };

  const handleSubmit = () => {
    Taro.showToast({ title: '已提交', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: '待开始',
      in_progress: '进行中',
      completed: '已完成'
    };
    return map[status] || status;
  };

  const completedCount = useMemo(() => {
    if (!task?.items) return 0;
    return task.items.filter(i => i.completed).length;
  }, [task]);

  if (!task) {
    return (
      <View className={styles.page}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>任务不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      {/* 顶部任务信息 */}
      <View className={styles.taskHeader}>
        <Text className={styles.taskTitle}>{task.title}</Text>
        <Text className={styles.taskDesc}>{task.description}</Text>
        <View className={styles.taskMeta}>
          <Text className={styles.metaItem}>截止：{task.deadline}</Text>
          <Text className={styles.metaItem}>发布：{task.createTime}</Text>
        </View>
      </View>

      {/* 进度卡片 */}
      <View className={styles.taskProgressCard}>
        <View className={styles.progressRow}>
          <Text className={styles.progressLabel}>
            完成进度 ({completedCount}/{task.items?.length || 0})
          </Text>
          <View className={classnames(
            styles.taskStatusTag,
            styles[task.status]
          )}>
            <Text>{getStatusText(task.status)}</Text>
          </View>
        </View>
        <View className={styles.progressBar}>
          <View
            className={styles.progressFill}
            style={{ width: `${task.progress || 0}%` }}
          />
        </View>
        <Text className={styles.progressValue} style={{ marginTop: '16rpx', textAlign: 'right' }}>
          {task.progress || 0}%
        </Text>
      </View>

      {/* 检查清单 */}
      <ScrollView className={styles.checklistSection} scrollY>
        <Text className={styles.sectionTitle}>检查项</Text>
        <View className={styles.checklist}>
          {task.items?.map(item => (
            <View
              key={item.id}
              className={styles.checkItem}
              onClick={() => handleToggle(item.id)}
            >
              <View className={classnames(
                styles.checkbox,
                item.completed && styles.checked
              )}>
                {item.completed && <Text>✓</Text>}
              </View>
              <View className={styles.checkItemContent}>
                <Text className={classnames(
                  styles.checkItemName,
                  item.completed && styles.completed
                )}>
                  {item.name}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: '160rpx' }} />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className={styles.bottomBar}>
        <View className={styles.btnOutline} onClick={() => Taro.navigateBack()}>
          <Text>返回</Text>
        </View>
        <View className={styles.btnPrimary} onClick={handleSubmit}>
          <Text>提交任务</Text>
        </View>
      </View>
    </View>
  );
};

export default TaskDetailPage;
