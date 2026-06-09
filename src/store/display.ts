import { create } from 'zustand';
import { useEffect } from 'react';
import { DisplayRecord } from '@/types';
import { shelfList, displayRecords, checkItems } from '@/data/display';
import { loadPersistState, savePersistState } from '@/utils/persist';

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
      createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
    };

    set(state => ({
      records: [newRecord, ...state.records]
    }));
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
