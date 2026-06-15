import { Extension } from "@tiptap/core";
import TableRow from "@tiptap/extension-table-row";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";

// 경계선으로 인식할 픽셀 범위
const HANDLE_ZONE = 5;
// 최소 행 높이(px)
const MIN_ROW_HEIGHT = 24;

// TableRow에 height 속성을 추가 (열 너비처럼 행 높이도 저장/복원되도록)
export const TableRowResizable = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element) => element.style.height || null,
        renderHTML: (attributes) => (attributes.height ? { style: `height: ${attributes.height}` } : {})
      }
    };
  }
});

type DragState = {
  startY: number;
  startHeight: number;
  rowTop: number;
  left: number;
  width: number;
  row: HTMLTableRowElement;
  rowPos: number;
} | null;

// tr DOM에서 해당 tableRow 노드의 시작 위치를 구한다
function rowNodePos(view: EditorView, tr: HTMLTableRowElement) {
  const pos = view.posAtDOM(tr, 0);
  const $pos = view.state.doc.resolve(pos);
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    if ($pos.node(depth).type.name === "tableRow") {
      return $pos.before(depth);
    }
  }
  return null;
}

// 행 아래 경계선을 드래그해 행 높이를 조절하는 플러그인 (드래그 위치에 가로선 표시)
export const TableRowResizing = Extension.create({
  name: "tableRowResizing",
  addProseMirrorPlugins() {
    let dragging: DragState = null;
    let bar: HTMLDivElement | null = null;

    const showBar = (left: number, width: number, top: number) => {
      if (!bar) return;
      bar.style.display = "block";
      bar.style.left = `${left}px`;
      bar.style.width = `${width}px`;
      bar.style.top = `${top}px`;
    };

    const hideBar = () => {
      if (bar) bar.style.display = "none";
    };

    const toggleCursor = (view: EditorView, active: boolean) => {
      view.dom.classList.toggle("row-resize-cursor", active);
    };

    return [
      new Plugin({
        key: new PluginKey("tableRowResizing"),
        view: () => {
          bar = document.createElement("div");
          bar.className = "row-resize-bar";
          bar.style.display = "none";
          document.body.appendChild(bar);
          return {
            destroy() {
              bar?.remove();
              bar = null;
            }
          };
        },
        props: {
          handleDOMEvents: {
            mousemove: (view, event) => {
              if (dragging) return false;
              const cell = (event.target as HTMLElement).closest("td, th") as HTMLElement | null;
              const table = cell?.closest("table") as HTMLElement | null;
              if (!cell || !table) {
                toggleCursor(view, false);
                hideBar();
                return false;
              }
              const rect = cell.getBoundingClientRect();
              const near = Math.abs(event.clientY - rect.bottom) <= HANDLE_ZONE;
              toggleCursor(view, near);
              if (near) {
                const tableRect = table.getBoundingClientRect();
                showBar(tableRect.left, tableRect.width, rect.bottom);
              } else {
                hideBar();
              }
              return false;
            },
            mouseleave: (view) => {
              if (!dragging) {
                toggleCursor(view, false);
                hideBar();
              }
              return false;
            },
            mousedown: (view, event) => {
              const cell = (event.target as HTMLElement).closest("td, th") as HTMLElement | null;
              const table = cell?.closest("table") as HTMLElement | null;
              if (!cell || !table) return false;
              const rect = cell.getBoundingClientRect();
              if (Math.abs(event.clientY - rect.bottom) > HANDLE_ZONE) return false;

              const row = cell.parentElement as HTMLTableRowElement | null;
              if (!row) return false;
              const rowPos = rowNodePos(view, row);
              if (rowPos === null) return false;

              const rowRect = row.getBoundingClientRect();
              const tableRect = table.getBoundingClientRect();
              event.preventDefault();
              dragging = {
                startY: event.clientY,
                startHeight: rowRect.height,
                rowTop: rowRect.top,
                left: tableRect.left,
                width: tableRect.width,
                row,
                rowPos
              };

              const onMove = (moveEvent: MouseEvent) => {
                if (!dragging) return;
                const next = Math.max(MIN_ROW_HEIGHT, dragging.startHeight + (moveEvent.clientY - dragging.startY));
                dragging.row.style.height = `${Math.round(next)}px`;
                showBar(dragging.left, dragging.width, dragging.rowTop + next);
              };

              const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
                if (!dragging) return;
                const { row: draggedRow, rowPos: pos } = dragging;
                const height = draggedRow.style.height;
                dragging = null;
                toggleCursor(view, false);
                hideBar();
                if (!height) return;
                const node = view.state.doc.nodeAt(pos);
                if (!node) return;
                view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, height }));
              };

              showBar(dragging.left, dragging.width, dragging.rowTop + dragging.startHeight);
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
              return true;
            }
          }
        }
      })
    ];
  }
});
