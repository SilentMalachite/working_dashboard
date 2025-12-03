# Working Dashboard Specification

## 最終更新日: 2025-12-03

## 現在の実装状況

### HTML版 (dashboard.html)
- ✅ 基本的な作業項目と名札の管理
- ✅ ドラッグ&ドロップ機能
- ✅ LocalStorageを使った自動保存
- ✅ Undo機能（最大50回）
- ✅ 名札と作業項目の色変更
- ✅ 作業項目の上下移動
- ✅ 名札と作業項目の個別削除

### Googleスプレッドシート版 (gas_dashboard.gs + sidebar.html)
- ✅ スプレッドシートのセルを使用したダッシュボード
- ✅ メニューからの各種操作
- ✅ サイドバーからの追加操作
- ✅ Undo機能（最大20回、PropertiesService使用）
- ✅ 名札と作業項目の色変更
- ✅ 作業項目の上下移動
- ✅ 名札と作業項目の個別削除
- ✅ コピー&ペーストでの名札移動
- ✅ 複数人での共同編集対応

---

## Dashboard Structure

### Overall Dashboard Composition

- The dashboard consists of multiple work items and multiple name tags.
- Each work item can have its name changed dynamically.
- Name tags can have any name or label entered freely (e.g., employee names or identifiers).
- Name tags should be pre-placed on the dashboard canvas for easy access and manipulation.

### Work Item Details

- Each individual work item includes stages: First (initial assignment), Double Check (review), and Final Confirmation (approval), in that sequential order.
- Place arrow icons or markers between each stage to visually indicate progression (e.g., First → Double Check → Final Confirmation).
- Allow each work item to be freely color-coded for visual distinction (e.g., via CSS classes or inline styles).
- Work items are grouped logically; enable reordering of these groups vertically (up/down) via drag-and-drop or buttons to adjust sequence.

### Name Tag Details

- Name tags should be freely color-coded to match teams, roles, or preferences (e.g., via CSS or attributes).
- Individual name tags can be dragged and dropped onto specific work item groups to assign personnel to tasks dynamically.
- **Reset Feature**: Include a "Reset Name Tags" button in the name tag section to move all distributed name tags back to the name tag pool.

### Dashboard Controls

- **Work Item Reset**: Include a "Reset Work Items" button to remove all work item rows. Name tags assigned to these rows must be preserved and returned to the name tag pool automatically.

## Technical Requirements

- Implement the dashboard using only HTML, CSS, and vanilla JavaScript (no external frameworks or libraries required).
- Ensure the entire application runs as a single HTML file for easy deployment and execution (embed all CSS and JS inline or in `<style>` and `<script>` tags).
- Use HTML5 elements (e.g., `<div>` for work items and name tags, `<canvas>` or DOM manipulation for layout if needed).
- Handle interactions like drag-and-drop with the HTML5 Drag and Drop API or mouse event listeners for compatibility.
- The dashboard should be responsive and work in modern web browsers without server-side dependencies.

## Please set the display and input language to Japanese.
