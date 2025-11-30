# Googleスプレッドシート版 作業ダッシュボード インストール手順

このドキュメントでは、Googleスプレッドシート上で作業ダッシュボードを動作させるためのコードと手順を説明します。

## 概要

Google Apps Script (GAS) を使用して、スプレッドシートのサイドバーまたはダイアログとしてダッシュボードを表示します。データの保存機能も簡易的に実装し、ブラウザを閉じても状態が維持されるようにします。

## インストール手順

1.  **Googleスプレッドシートを開く**
    *   新しいスプレッドシートを作成するか、既存のシートを開きます。

2.  **スクリプトエディタを開く**
    *   メニューの **「拡張機能」** > **「Apps Script」** をクリックします。

3.  **コードの貼り付け (Code.gs)**
    *   デフォルトで開いている `コード.gs` (または `Code.gs`) の内容をすべて削除し、以下の **[Code.gs]** の内容を貼り付けます。

4.  **HTMLファイルの作成 (index.html)**
    *   「ファイル」の横にある **「＋」** ボタンをクリックし、**「HTML」** を選択します。
    *   ファイル名を `index` と入力します（自動的に `index.html` になります）。
    *   作成されたファイルの中身をすべて削除し、以下の **[index.html]** の内容を貼り付けます。

5.  **スクリプトの実行と権限の承認**
    *   ツールバーのプルダウンから `onOpen` を選択し、**「実行」** ボタンをクリックします。
    *   「承認が必要です」というダイアログが表示された場合：
        1.  「権限を確認」をクリック。
        2.  Googleアカウントを選択。
        3.  「このアプリはGoogleによって確認されていません」と表示されたら、**「詳細」** > **「無題のプロジェクト（安全ではないページ）に移動」** をクリック。
        4.  「許可」をクリック。

6.  **ダッシュボードの起動**
    *   スプレッドシートのタブに戻ります。
    *   メニューバーの右側に新しく **「ダッシュボード」** というメニューが追加されています（表示されない場合はページをリロードしてください）。
    *   **「ダッシュボード」 > 「開く」** をクリックすると、サイドバーにダッシュボードが表示されます。

---

## [Code.gs]

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('ダッシュボード')
      .addItem('開く', 'showDashboard')
      .addToUi();
}

function showDashboard() {
  var html = HtmlService.createHtmlOutputFromFile('index')
      .setTitle('作業ダッシュボード')
      .setWidth(1000);
  // サイドバーとして表示（ダイアログが良い場合は showModalDialog などに変更可）
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * クライアント側から呼ばれるデータ保存関数
 * スプレッドシートのドキュメントプロパティにJSONとして保存します。
 * (容量制限があるため、大量データの場合はシートへの書き込みに変更を推奨)
 */
function saveDashboardState(jsonString) {
  var props = PropertiesService.getDocumentProperties();
  props.setProperty('DASHBOARD_STATE', jsonString);
  return { success: true };
}

/**
 * クライアント側から呼ばれるデータ読み込み関数
 */
function loadDashboardState() {
  var props = PropertiesService.getDocumentProperties();
  var jsonString = props.getProperty('DASHBOARD_STATE');
  return jsonString || null;
}
```

---

## [index.html]

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <base target="_top">
    <style>
        /* スプレッドシートのサイドバー用にスタイルを調整 */
        body {
            font-family: "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 10px;
            background-color: #f0f2f5;
            color: #333;
            font-size: 14px;
        }

        h2 {
            text-align: center;
            margin: 10px 0;
            font-size: 18px;
        }

        .controls {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }

        button {
            padding: 6px 12px;
            cursor: pointer;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
        }

        button:hover { background-color: #0056b3; }
        button.save-btn { background-color: #28a745; }
        button.save-btn:hover { background-color: #218838; }

        .dashboard-layout {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        /* Name Tag Section */
        .name-tag-section {
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .name-tag-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            min-height: 60px;
            border: 2px dashed #ddd;
            padding: 5px;
            border-radius: 4px;
        }

        .name-tag {
            padding: 4px 8px;
            background-color: #e0e0e0;
            border-radius: 15px;
            cursor: grab;
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 3px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        
        .name-tag input[type="color"] {
            width: 12px; height: 12px; border: none; padding: 0; background: none; cursor: pointer;
        }

        .delete-btn { margin-left: 4px; color: #888; cursor: pointer; font-size: 10px; }
        .delete-btn:hover { color: red; }

        /* Work Items */
        .work-items-section { display: flex; flex-direction: column; gap: 10px; }

        .work-item-row {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 10px;
            display: flex;
            flex-direction: column; /* サイドバー向けに縦並びへ変更 */
            gap: 10px;
            position: relative;
        }

        .row-header {
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }

        .row-controls { display: flex; gap: 2px; }
        .row-btn { padding: 2px 6px; font-size: 10px; background: #eee; color: #333; width: auto; }

        .work-item-title {
            font-weight: bold;
            font-size: 14px;
            flex-grow: 1;
            outline: none;
        }

        .stages-container {
            display: flex;
            flex-direction: column; /* サイドバー向けに縦並び */
            gap: 5px;
        }

        .stage {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 5px;
            min-height: 50px;
            display: flex;
            flex-direction: row; /* ステージ内は横並びでタグ表示 */
            align-items: center;
            gap: 5px;
        }

        .stage-label {
            writing-mode: vertical-rl;
            font-size: 10px;
            color: #666;
            font-weight: bold;
            padding: 2px;
            border-right: 1px solid #ddd;
            min-height: 40px;
            text-align: center;
        }

        .stage-content {
            flex: 1;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            min-height: 40px;
            align-items: center;
        }

        .drag-over { background-color: #e3f2fd; border: 2px solid #2196f3; }
        .dragging { opacity: 0.5; }

    </style>
</head>
<body>

    <h2>作業ダッシュボード</h2>
    
    <div class="controls">
        <button onclick="saveData()" class="save-btn">保存する</button>
        <button onclick="loadData()">読み込み</button>
    </div>

    <div class="dashboard-layout">
        <div class="name-tag-section">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>人員 (名札)</strong>
                <div>
                    <button onclick="addNameTag()" style="padding:2px 8px; font-size:10px;">＋追加</button>
                    <button onclick="resetNameTags()" style="padding:2px 8px; font-size:10px; background-color: #6c757d;">配置リセット</button>
                </div>
            </div>
            <div id="nameTagPool" class="name-tag-container" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
        </div>

        <div class="work-items-section">
            <div style="margin-bottom:5px; display: flex; gap: 5px;">
                <button onclick="addWorkItem()" style="flex: 1;">＋ 作業項目を追加</button>
                <button onclick="resetWorkItems()" style="background-color: #dc3545;">作業全消去</button>
            </div>
            <div id="workItemsContainer"></div>
        </div>
    </div>

    <script>
        let tagIdCounter = 0;
        let workItemIdCounter = 0;

        // --- Drag & Drop ---
        function allowDrop(ev) {
            ev.preventDefault();
            ev.target.closest('.stage-content, .name-tag-container').classList.add('drag-over');
        }

        document.addEventListener('dragleave', function(ev) {
            const zone = ev.target.closest('.stage-content, .name-tag-container');
            if (zone && !zone.contains(ev.relatedTarget)) {
                zone.classList.remove('drag-over');
            }
        });

        function drag(ev) {
            ev.dataTransfer.setData("text/plain", ev.target.id);
            ev.target.classList.add('dragging');
        }

        function dragEnd(ev) {
            ev.target.classList.remove('dragging');
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        }

        function drop(ev) {
            ev.preventDefault();
            const data = ev.dataTransfer.getData("text/plain");
            const draggedElement = document.getElementById(data);
            const dropZone = ev.target.closest('.stage-content') || ev.target.closest('.name-tag-container');
            
            if (dropZone && draggedElement) {
                dropZone.classList.remove('drag-over');
                dropZone.appendChild(draggedElement);
            }
        }

        // --- Reset Functions ---
        function resetNameTags() {
            if (!confirm('すべての名札を初期位置に戻しますか？')) return;
            const pool = document.getElementById('nameTagPool');
            document.querySelectorAll('.name-tag').forEach(tag => pool.appendChild(tag));
        }

        function resetWorkItems() {
            if (!confirm('すべての作業項目を削除しますか？\\n（名札はプールに戻ります）')) return;
            const pool = document.getElementById('nameTagPool');
            document.querySelectorAll('.work-item-row').forEach(row => {
                row.querySelectorAll('.name-tag').forEach(tag => pool.appendChild(tag));
                row.remove();
            });
        }

        // --- Components ---
        function addNameTag(name = "名札", id = null, color = "#e0e0e0", parentId = 'nameTagPool') {
            tagIdCounter++;
            const tagId = id || `tag-${Date.now()}-${tagIdCounter}`;
            
            const tag = document.createElement('div');
            tag.className = 'name-tag';
            tag.id = tagId;
            tag.draggable = true;
            tag.ondragstart = drag;
            tag.ondragend = dragEnd;
            tag.style.backgroundColor = color;

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = color;
            colorInput.oninput = (e) => tag.style.backgroundColor = e.target.value;
            
            const nameSpan = document.createElement('span');
            nameSpan.contentEditable = true;
            nameSpan.textContent = name;
            
            const delBtn = document.createElement('span');
            delBtn.className = 'delete-btn';
            delBtn.textContent = '×';
            delBtn.onclick = () => { if(confirm('削除しますか？')) tag.remove(); };

            tag.appendChild(colorInput);
            tag.appendChild(nameSpan);
            tag.appendChild(delBtn);

            const parent = document.getElementById(parentId) || document.getElementById('nameTagPool');
            parent.appendChild(tag);
            return tag;
        }

        function addWorkItem(title = "作業項目", id = null, bgColor = "#ffffff", stagesData = {}) {
            workItemIdCounter++;
            const rowId = id || `work-${Date.now()}-${workItemIdCounter}`;
            const container = document.getElementById('workItemsContainer');
            
            const row = document.createElement('div');
            row.className = 'work-item-row';
            row.id = rowId;
            row.style.backgroundColor = bgColor;

            // Header
            const header = document.createElement('div');
            header.className = 'row-header';
            
            const controls = document.createElement('div');
            controls.className = 'row-controls';
            controls.innerHTML = `
                <button class="row-btn" onclick="this.closest('.work-item-row').previousElementSibling?.before(this.closest('.work-item-row'))">▲</button>
                <button class="row-btn" onclick="this.closest('.work-item-row').nextElementSibling?.after(this.closest('.work-item-row'))">▼</button>
                <button class="row-btn" style="color:red" onclick="if(confirm('削除しますか？')) this.closest('.work-item-row').remove()">×</button>
            `;

            const colorIn = document.createElement('input');
            colorIn.type = 'color';
            colorIn.value = bgColor;
            colorIn.style.width = '15px'; colorIn.style.border='none'; colorIn.style.padding='0';
            colorIn.oninput = (e) => row.style.backgroundColor = e.target.value;

            const titleDiv = document.createElement('div');
            titleDiv.className = 'work-item-title';
            titleDiv.contentEditable = true;
            titleDiv.textContent = title;

            header.appendChild(controls);
            header.appendChild(colorIn);
            header.appendChild(titleDiv);

            // Stages
            const stagesContainer = document.createElement('div');
            stagesContainer.className = 'stages-container';
            
            const stageDefs = [
                {id: 's1', label: '一次'},
                {id: 's2', label: '確認'},
                {id: 's3', label: '承認'}
            ];

            stageDefs.forEach(def => {
                const sDiv = document.createElement('div');
                sDiv.className = 'stage';
                sDiv.innerHTML = `<div class="stage-label">${def.label}</div>`;
                
                const content = document.createElement('div');
                content.className = 'stage-content';
                content.id = `${rowId}-${def.id}`; // Unique ID for saving
                content.ondrop = drop;
                content.ondragover = allowDrop;
                
                sDiv.appendChild(content);
                stagesContainer.appendChild(sDiv);
            });

            row.appendChild(header);
            row.appendChild(stagesContainer);
            container.appendChild(row);
            
            return row;
        }

        // --- Save & Load Logic ---
        function getDashboardState() {
            const state = {
                tags: [],
                workItems: []
            };

            // Tags in pool
            document.querySelectorAll('#nameTagPool .name-tag').forEach(tag => {
                state.tags.push({
                    id: tag.id,
                    name: tag.querySelector('span').innerText,
                    color: tag.querySelector('input[type="color"]').value,
                    parent: 'nameTagPool'
                });
            });

            // Work Items
            document.querySelectorAll('.work-item-row').forEach(row => {
                const stages = {};
                row.querySelectorAll('.stage-content').forEach(sc => {
                    // Get tags in this stage
                    const stageTags = [];
                    sc.querySelectorAll('.name-tag').forEach(tag => {
                        stageTags.push({
                            id: tag.id,
                            name: tag.querySelector('span').innerText,
                            color: tag.querySelector('input[type="color"]').value
                        });
                    });
                    stages[sc.id] = stageTags;
                });

                state.workItems.push({
                    id: row.id,
                    title: row.querySelector('.work-item-title').innerText,
                    bgColor: row.querySelector('.row-header input[type="color"]').value,
                    stages: stages
                });
            });
            
            return state;
        }

        function restoreState(state) {
            if (!state) return;
            
            // Clear existing
            document.getElementById('nameTagPool').innerHTML = '';
            document.getElementById('workItemsContainer').innerHTML = '';

            // Restore Work Items & their tags
            state.workItems.forEach(item => {
                const row = addWorkItem(item.title, item.id, item.bgColor);
                // Restore tags in stages
                Object.keys(item.stages).forEach(stageId => {
                    // The stage content ID might differ if logic changed, but here we constructed it as rowId-suffix
                    // We need to find the stage div that matches.
                    // Since we created them in order: s1, s2, s3
                    // Let's look for the DOM element with the specific ID if possible, or infer.
                    // Actually, row children logic is deterministic.
                    const stageContent = document.getElementById(stageId);
                    if (stageContent) {
                         item.stages[stageId].forEach(tagData => {
                             addNameTag(tagData.name, tagData.id, tagData.color, stageId);
                         });
                    }
                });
            });

            // Restore Pool Tags
            state.tags.forEach(tag => {
                addNameTag(tag.name, tag.id, tag.color, 'nameTagPool');
            });
        }

        function saveData() {
            const state = getDashboardState();
            const json = JSON.stringify(state);
            google.script.run.withSuccessHandler(() => alert('保存しました'))
                             .saveDashboardState(json);
        }

        function loadData() {
            google.script.run.withSuccessHandler(json => {
                if (json) {
                    restoreState(JSON.parse(json));
                } else {
                    // Initial data
                    addNameTag("佐藤");
                    addWorkItem("サンプルタスク");
                }
            }).loadDashboardState();
        }

        // Auto load on start
        window.onload = loadData;

    </script>
</body>
</html>
```
