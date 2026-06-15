"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type SlashItem = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  command: () => void;
};

export type SlashMenuRef = {
  onKeyDown: (event: KeyboardEvent) => boolean;
};

type Props = {
  items: SlashItem[];
};

export const SlashMenuList = forwardRef<SlashMenuRef, Props>(function SlashMenuList({ items }, ref) {
  const [selected, setSelected] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => setSelected(0), [items]);

  // 선택 항목이 보이도록 스크롤 따라가기
  useEffect(() => {
    itemRefs.current[selected]?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  function select(index: number) {
    items[index]?.command();
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: (event) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowUp") {
        setSelected((value) => (value + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelected((value) => (value + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        select(selected);
        return true;
      }
      return false;
    }
  }));

  if (items.length === 0) {
    return (
      <div className="slash-menu">
        <div className="slash-empty">결과 없음</div>
      </div>
    );
  }

  return (
    <div className="slash-menu">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            className={index === selected ? "slash-item is-active" : "slash-item"}
            onMouseEnter={() => setSelected(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(index)}
          >
            <span className="slash-icon">
              <Icon className="h-4 w-4" />
            </span>
            <span className="slash-text">
              <span className="slash-title">{item.title}</span>
              <span className="slash-subtitle">{item.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
});
