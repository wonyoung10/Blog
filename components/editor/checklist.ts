// 체크리스트(할 일 목록) 확장
// @tiptap/extension-task-list, @tiptap/extension-task-item 는 메인이 설치한다.
// TaskItem 은 중첩(nested) 을 허용한다.

import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

// useEditor 의 extensions 배열에 스프레드(...)로 펼쳐 넣는다.
export const checklistExtensions = [TaskList, TaskItem.configure({ nested: true })];
