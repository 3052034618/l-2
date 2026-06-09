import Taro from '@tarojs/taro';

const PERSIST_PREFIX = 'smart_retail_';

export function loadPersistState<T>(key: string, defaultState: T): T {
  try {
    const stored = Taro.getStorageSync(`${PERSIST_PREFIX}${key}`);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.warn('[persist] 读取失败:', key, e);
  }
  return defaultState;
}

export function savePersistState(key: string, state: unknown): void {
  try {
    Taro.setStorageSync(`${PERSIST_PREFIX}${key}`, JSON.stringify(state));
  } catch (e) {
    console.warn('[persist] 保存失败:', key, e);
  }
}

export function clearPersistState(key: string): void {
  try {
    Taro.removeStorageSync(`${PERSIST_PREFIX}${key}`);
  } catch (e) {
    console.warn('[persist] 清除失败:', key, e);
  }
}
