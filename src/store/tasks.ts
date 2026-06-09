import { create } from 'zustand';
import { Task } from '@/types';
import { taskList, messages } from '@/data/tasks';

interface TasksState {
  tasks: Task[];
  messages: {
    id: string;
    type: string;
    title: string;
    content: string;
    time: string;
    read: boolean;
  }[];

  toggleTaskItem: (taskId: string, itemId: string) => void;
  getTaskById: (id: string) => Task | undefined;
  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;
  getPendingCount: () => number;
  getUnreadMessageCount: () => number;
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

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: taskList,
  messages: messages,

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
  },

  markAllMessagesRead: () => {
    set(state => ({
      messages: state.messages.map(m => ({ ...m, read: true }))
    }));
  },

  getPendingCount: () => {
    return get().tasks.filter(t => t.status !== 'completed').length;
  },

  getUnreadMessageCount: () => {
    return get().messages.filter(m => !m.read).length;
  }
}));
