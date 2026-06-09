import { create } from 'zustand';
import { useEffect } from 'react';
import { DisplayRecord } from '@/types';
import { shelfList, displayRecords, checkItems } from '@/data/display';
import { loadPersistState, savePersistState } from '@/utils/persist';
import { useTasksStore } from './tasks';

const PERSIST_KEY = 'display_store';

interface DisplayState {
  shelves: {
    id: string;
    name: string;
    category: string;
    status: 'checked' | 'pending' | 'abnormal';
    lastCheck: string;
  }[];
  records: DisplayRecord[];
  checkItems: { id: string; name: string; required: boolean }[];
  _initialized: boolean;

  addRecord: (record: Omit<DisplayRecord, 'id' | 'createTime'>) => void;
  updateShelfStatus: (shelfId: string, status: 'checked' | 'abnormal') => void;
  createRectificationTask: (recordId: string) => void;
  submitRectification: (recordId: string, images: string[], remark: string) => void;
  getRecordById: (id: string) => DisplayRecord | undefined;
  _persist: () => void;
}

const defaultState = {
  shelves: shelfList,
  records: displayRecords,
  checkItems: checkItems,
  _initialized: false
};

export const useDisplayStore = create<DisplayState>((set, get) => ({
  ...defaultState,

  addRecord: (record) => {
    console.log('[DisplayStore] 添加陈列记录:', record);
    const newRecord: DisplayRecord = {
      ...record,
      id: `record_${Date.now()}`,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      rectificationStatus: record.status === 'abnormal' ? 'pending' : undefined
    };

    set(state => ({
      records: [newRecord, ...state.records]
    }));

    if (record.status === 'abnormal') {
      get().createRectificationTask(newRecord.id);
    }

    get()._persist();
  },

  updateShelfStatus: (shelfId, status) => {
    console.log('[DisplayStore] 更新货架状态:', shelfId, status);
    set(state => ({
      shelves: state.shelves.map(s =>
        s.id === shelfId
          ? {
              ...s,
              status,
              lastCheck: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
            }
          : s
      )
    }));
    get()._persist();
  },

  createRectificationTask: (recordId) => {
    console.log('[DisplayStore] 生成整改任务:', recordId);
    const record = get().records.find(r => r.id === recordId);
    if (!record) return;

    const tasksStore = useTasksStore.getState();
    const existingTask = tasksStore.tasks.find(
      t => t.relatedRecordId === recordId && t.type === 'rectification'
    );
    if (existingTask) return;

    const newTask = {
      id: `task_rect_${Date.now()}`,
      title: `${record.shelfName}陈列整改`,
      type: 'rectification' as const,
      description: `针对${record.shelfName}的陈列异常问题进行整改，提交整改照片和说明。`,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'pending' as const,
      progress: 0,
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      relatedRecordId: recordId,
      items: [
        { id: 'r1', name: '整理商品陈列', completed: false },
        { id: 'r2', name: '补充缺货商品', completed: false },
        { id: 'r3', name: '拍摄整改照片', completed: false },
        { id: 'r4', name: '填写整改说明', completed: false }
      ]
    };

    useTasksStore.setState(state => ({
      tasks: [newTask, ...state.tasks]
    }));
    useTasksStore.getState()._persist();
  },

  submitRectification: (recordId, images, remark) => {
    console.log('[DisplayStore] 提交整改:', recordId, images.length);
    const record = get().records.find(r => r.id === recordId);
    if (!record) return;

    set(state => ({
      records: state.records.map(r =>
        r.id === recordId
          ? {
              ...r,
              rectificationStatus: 'completed',
              rectificationImages: images,
              rectificationRemark: remark,
              rectificationTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
            }
          : r
      )
    }));

    // 更新对应任务
    const tasksStore = useTasksStore.getState();
    const task = tasksStore.tasks.find(
      t => t.relatedRecordId === recordId && t.type === 'rectification'
    );
    if (task && task.items) {
      const newItems = task.items.map(item => ({ ...item, completed: true }));
      useTasksStore.setState(state => ({
        tasks: state.tasks.map(t =>
          t.id === task.id
            ? { ...t, items: newItems, progress: 100, status: 'completed' }
            : t
        )
      }));
      useTasksStore.getState()._persist();
    }

    get()._persist();
  },

  getRecordById: (id) => {
    return get().records.find(r => r.id === id);
  },

  _persist: () => {
    const { shelves, records } = get();
    savePersistState(PERSIST_KEY, { shelves, records });
  }
}));

export function useDisplayInit() {
  useEffect(() => {
    const stored = loadPersistState<{
      shelves: typeof shelfList;
      records: DisplayRecord[];
    } | null>(PERSIST_KEY, null);

    if (stored) {
      console.log('[DisplayStore] 从本地存储恢复数据');
      useDisplayStore.setState({
        shelves: stored.shelves,
        records: stored.records,
        _initialized: true
      });
    } else {
      useDisplayStore.setState({ _initialized: true });
    }
  }, []);
}
