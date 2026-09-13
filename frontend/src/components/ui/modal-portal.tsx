"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * ฉากหลังของ modal ที่กางเต็มจอจริง
 *
 * 🔴 ต้อง render ที่ body เสมอ ห้ามปล่อยไว้ในที่ของตัวเอง
 * เพราะ element แม่ที่มี transform (เช่น .animate-rise ซึ่งใช้ animation-fill-mode: both
 * จึงค้าง transform ไว้ถาวรหลังเล่นจบ) จะกลายเป็น containing block ของ position: fixed
 * ทำให้ inset-0 กางเต็มแค่กล่องนั้น ไม่ใช่เต็มจอ
 *
 * ล็อกการเลื่อนพื้นหลังด้วย เพราะถ้าเลื่อนได้ผู้ใช้จะเลื่อนจนหลุดจาก modal
 */
export function ModalPortal({
  onClose,
  label,
  children,
}: {
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);

    const { overflow, paddingRight } = document.body.style;
    /** ชดเชยความกว้างแถบเลื่อนที่หายไป ไม่งั้นหน้าจอกระตุกตอนเปิด modal */
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="animate-fade fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      {children}
    </div>,
    document.body,
  );
}
