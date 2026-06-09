import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { taskList, messages } from '@/data/tasks';
import { getTaskTypeText, getTaskStatusText } from '@/utils';

type TabType = 'tasks' | 'messages';
type TaskFilterType = 'all' | 'pending' | 'in_progress' | 'completed';

const TasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [taskFilter, setTaskFilter] = useState<TaskFilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 1000);
  });

  const unreadCount = messages.filter(m => !m.read).length;
  const pendingTaskCount = taskList.filter(t => t.status !== 'completed').length;

  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return taskList;
    return taskList.filter(t => t.status === taskFilter);
  }, [taskFilter]);

  const taskFilters = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'in_progress', label: '进行中' },
    { key: 'completed', label: '已完成' }
  ];

  const handleTaskClick = (taskId: string) => {
    console.log('[Tasks] 点击任务:', taskId);
    Taro.showToast({ title: '任务详情', icon: 'none' });
  };

  const handleMessageClick = (msgId: string) => {
    console.log('[Tasks] 点击消息:', msgId);
    Taro.showToast({ title: '消息详情', icon: 'none' });
  };

  const getTypeEmoji = (type: string) => {
    const map: Record<string, string> = {
      system: '📢',
      alert: '⚠️',
      task: '📋'
    };
    return map[type] || '📌';
  };

  const isUrgent = (deadline: string) => {
    const now = new Date();
    const dl = new Date(deadline);
    const diffDays = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <View className={styles.page}>
      {/* Tab栏 */}
      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'tasks' && styles.active)}
          onClick={() => setActiveTab('tasks')}
        >
          <Text>任务</Text>
          {pendingTaskCount > 0 && (
            <View className={styles.tabBadge}>{pendingTaskCount}</View>
          )}
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'messages' && styles.active)}
          onClick={() => setActiveTab('messages')}
        >
          <Text>消息</Text>
          {unreadCount > 0 && (
            <View className={styles.tabBadge}>{unreadCount}</View>
          )}
        </View>
      </View>

      {activeTab === 'tasks' ? (
        <>
          {/* 筛选栏 */}
          <ScrollView className={styles.filterBar} scrollX>
            {taskFilters.map(filter => (
              <View
                key={filter.key}
                className={classnames(
                  styles.filterItem,
                  taskFilter === filter.key && styles.active
                )}
                onClick={() => setTaskFilter(filter.key as TaskFilterType)}
              >
                <Text>{filter.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* 任务列表 */}
          <ScrollView className={styles.taskList} scrollY>
            {filteredTasks.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📭</Text>
                <Text className={styles.emptyText}>暂无任务</Text>
              </View>
            ) : (
              filteredTasks.map(task => (
                <View
                  key={task.id}
                  className={styles.taskCard}
                  onClick={() => handleTaskClick(task.id)}
                >
                  <View className={styles.taskHeader}>
                    <Text className={styles.taskTitle}>{task.title}</Text>
                    <View
                      className={classnames(styles.taskTypeTag, styles[task.type])}
                    >
                      <Text>{getTaskTypeText(task.type)}</Text>
                    </View>
                  </View>

                  <Text className={styles.taskDesc}>{task.description}</Text>

                  <View className={styles.taskMeta}>
                    <Text
                      className={classnames(
                        styles.deadline,
                        isUrgent(task.deadline) && styles.urgent
                      )}
                    >
                      截止: {task.deadline}
                    </Text>
                    <View
                      className={classnames(styles.taskStatus, styles[task.status])}
                    >
                      <Text>{getTaskStatusText(task.status)}</Text>
                    </View>
                  </View>

                  {task.progress !== undefined && (
                    <>
                      <View className={styles.progressBar}>
                        <View
                          className={styles.progressFill}
                          style={{ width: `${task.progress}%` }}
                        />
                      </View>
                      <Text className={styles.progressText}>
                        完成进度 {task.progress}%
                      </Text>
                    </>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </>
      ) : (
        /* 消息列表 */
        <ScrollView className={styles.messageList} scrollY>
          {messages.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>💬</Text>
              <Text className={styles.emptyText}>暂无消息</Text>
            </View>
          ) : (
            messages.map(msg => (
              <View
                key={msg.id}
                className={classnames(
                  styles.messageCard,
                  !msg.read && styles.unread
                )}
                onClick={() => handleMessageClick(msg.id)}
              >
                <View className={classnames(styles.messageIcon, styles[msg.type])}>
                  <Text>{getTypeEmoji(msg.type)}</Text>
                </View>
                <View className={styles.messageContent}>
                  <Text className={styles.messageTitle}>{msg.title}</Text>
                  <Text className={styles.messageText}>{msg.content}</Text>
                  <Text className={styles.messageTime}>{msg.time}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default TasksPage;
