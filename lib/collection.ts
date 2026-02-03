// lib/collection.ts
// 收藏功能 - 使用 localStorage 存储

import { Rarity } from './titles';

export interface CollectionItem {
  id: string;           // 结果ID
  titleId: number;      // 称号ID
  title: string;        // 称号名称
  rarity: Rarity;       // 稀有度
  description: string;  // 描述
  image: string;        // 生成的图片
  petType: string;      // 宠物类型：cat_female, cat_male, dog_female, dog_male
  collectedAt: number;  // 收藏时间戳
}

const COLLECTION_KEY = 'pet_identity_collection';
const UNLOCKED_KEY = 'pet_identity_unlocked';

// 获取所有收藏
export function getCollection(): CollectionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(COLLECTION_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 添加到收藏
export function addToCollection(item: Omit<CollectionItem, 'collectedAt'>): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const collection = getCollection();

    // 检查是否已存在
    if (collection.some(c => c.id === item.id)) {
      return false;
    }

    collection.push({
      ...item,
      collectedAt: Date.now(),
    });

    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));

    // 同时更新解锁记录
    addToUnlocked(item.titleId);

    return true;
  } catch {
    return false;
  }
}

// 从收藏移除
export function removeFromCollection(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const collection = getCollection();
    const filtered = collection.filter(c => c.id !== id);
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// 检查是否已收藏
export function isCollected(id: string): boolean {
  const collection = getCollection();
  return collection.some(c => c.id === id);
}

// 获取已解锁的称号ID列表
export function getUnlockedTitleIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(UNLOCKED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 添加到解锁记录
export function addToUnlocked(titleId: number): void {
  if (typeof window === 'undefined') return;
  try {
    const unlocked = getUnlockedTitleIds();
    if (!unlocked.includes(titleId)) {
      unlocked.push(titleId);
      localStorage.setItem(UNLOCKED_KEY, JSON.stringify(unlocked));
    }
  } catch {
    // ignore
  }
}

// 获取解锁进度
export function getUnlockProgress(totalTitles: number = 100): { unlocked: number; total: number; percent: number } {
  const unlocked = getUnlockedTitleIds().length;
  return {
    unlocked,
    total: totalTitles,
    percent: Math.round((unlocked / totalTitles) * 100),
  };
}

// 获取各稀有度的收藏统计
export function getCollectionStats(): { SSR: number; SR: number; R: number; N: number; total: number } {
  const collection = getCollection();
  const stats = { SSR: 0, SR: 0, R: 0, N: 0, total: collection.length };

  collection.forEach(item => {
    stats[item.rarity]++;
  });

  return stats;
}

// 清空收藏（调试用）
export function clearCollection(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(COLLECTION_KEY);
  localStorage.removeItem(UNLOCKED_KEY);
}
