"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * จำค่าที่ผู้ใช้เลือกไว้ข้ามการเข้าใช้งาน เช่น จำนวนแถวต่อหน้า
 *
 * ใช้ useSyncExternalStore ไม่ใช่ useState คู่ useEffect เพราะ localStorage
 * เป็นแหล่งข้อมูลนอก React ถ้าอ่านใน effect แล้ว setState จะเกิด render ซ้อน
 * และฝั่ง server ไม่มี localStorage ตัวนี้จึงแยก snapshot ของ server ให้ด้วย
 */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useStoredState<T>(
  key: string,
  fallback: T,
): [T, (value: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  const parsed = ((): T => {
    if (value === null) return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  })();

  const update = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // โหมดส่วนตัวหรือปิด storage ไว้ จำไม่ได้ก็ไม่ควรทำให้หน้าจอพัง
      }
      for (const listener of listeners) listener();
    },
    [key],
  );

  return [parsed, update];
}
