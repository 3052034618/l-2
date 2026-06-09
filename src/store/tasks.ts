import { create } from 'zustand';
import { useEffect } from 'react';
import { Task } from '@/types';
import { taskList, messages } from '@/data/tasks';
import { loadPersistState, savePersistState } from '@/utils/persist';

const PERSIST_KEY = 'tasks_store';

interface Message {
  id: string;
  type: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
  taskId?: string;
}

interface TasksState {
  tasks: Task[];
  messages: Message[];
  _initialized: boolean;

  toggleTaskItem: (taskId: string, itemId: string) => void;
  getTaskById: (id: string) => Task | undefined;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  getPendingCount: () => number;
  getUnreadMessageCount: () => number;
  _persist: () => void;
}

function calculateProgress(items: { completed: boolean }[] | undefined): number {
  if (!items || items.length === 0) return 0;
  const completed = items.filter(i => i.completed).length;
  return Math.round((completed / items.length) * 100);
}

function getTaskStatus(progress: number): 'pending' | 'in_progress' | 'completed' {
  if (progress === 0) return 'pending';
  if (progress === 100) return 'completed';
  return 'in_progress';
}

const defaultState = {
  tasks: taskList,
  messages: messages,
  _initialized: false
};

export const useTasksStore = create<TasksState>((set, get) => ({
  ...defaultState,

  toggleTaskItem: (taskId, itemId) => {
    console.log('[TasksStore] 切换任务项:', taskId, itemId);
    set(state => {
      const newTasks = state.tasks.map(task => {
        if (task.id !== taskId || !task.items) return task;

        const newItems = task.items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );

        const progress = calculateProgress(newItems);
        const status = getTaskStatus(progress);

        return {
          ...task,
          items: newItems,
          progress,
          status
        };
      });

      return { tasks: newTasks };
    });
    get()._persist();
  },

  getTaskById: (id) => {
    return get().tasks.find(t => t.id === id);
  },

  markMessageRead: (id) => {
    set(state => ({
      messages: state.messages.map(m =>
        m.id === id ? { ...m, read: true } : m
      )
    }));
    get()._persist();
  },

  markAllMessagesRead: () => {
    set(state => ({
      messages: state.messages.map(m => ({ ...m, read: true }))
    }));
    get()._persist();
  },

  getPendingCount: () => {
    return get().tasks.filter(t => t.status !== 'completed').length;
  },

  getUnreadMessageCount: () => {
    return get().messages.filter(m => !m.read).length;
  },

  _persist: () => {
    const { tasks, messages } = get();
    savePersistState(PERSIST_KEY, { tasks, messages });
  }
}));

export function useTasksInit() {
  useEffect(() => {
    const stored = loadPersistState<{
      tasks: Task[];
      messages: Message[];
    } | null>(PERSIST_KEY, null);

    if (stored) {
      console.log('[TasksStore] 从本地存储恢复数据');
      useTasksStore.setState({
        tasks: stored.tasks,
        messages: stored.messages,
        _initialized: true
      });
    } else {
      useTasksStore.setState({ _initialized: true });
    }
  }, []);
}
