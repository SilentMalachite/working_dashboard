// 作業ダッシュボード - Google Apps Script版
// このコードをスプレッドシートのスクリプトエディタに貼り付けて使用してください

// シート名の定数
const SHEET_NAME = '作業ダッシュボード';
const NAME_TAG_POOL_COL = 'B';  // 名札プールの列
const WORK_ITEMS_START_ROW = 3;  // 作業項目の開始行
const HISTORY_KEY = 'UNDO_HISTORY';  // Undo履歴のキー
const MAX_HISTORY = 20;  // 最大履歴数

// メニューを追加
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('ダッシュボード')
    .addItem('初期化', 'initializeDashboard')
    .addSeparator()
    .addItem('名札を追加', 'addNameTagDialog')
    .addItem('作業項目を追加', 'addWorkItemDialog')
    .addSeparator()
    .addItem('名札を配置リセット', 'resetNameTags')
    .addItem('作業項目を全消去', 'resetWorkItems')
    .addSeparator()
    .addItem('元に戻す (Undo)', 'undo')
    .addSeparator()
    .addItem('サイドバーを開く', 'showSidebar')
    .addToUi();
}

// ダッシュボードの初期化
function initializeDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear();
  }
  
  // 列幅の設定
  sheet.setColumnWidth(1, 150);  // A: 作業項目名
  sheet.setColumnWidth(2, 200);  // B: 名札プール
  sheet.setColumnWidth(3, 200);  // C: 一次作業
  sheet.setColumnWidth(4, 50);   // D: 矢印
  sheet.setColumnWidth(5, 200);  // E: ダブルチェック
  sheet.setColumnWidth(6, 50);   // F: 矢印
  sheet.setColumnWidth(7, 200);  // G: 最終確認
  
  // ヘッダーの設定
  sheet.getRange('A1').setValue('作業ダッシュボード').setFontSize(16).setFontWeight('bold');
  sheet.getRange('B2').setValue('名札プール').setFontWeight('bold').setBackground('#e8eaf6');
  sheet.getRange('C2').setValue('一次作業').setFontWeight('bold').setBackground('#e3f2fd');
  sheet.getRange('D2').setValue('→').setHorizontalAlignment('center');
  sheet.getRange('E2').setValue('ダブルチェック').setFontWeight('bold').setBackground('#fff3e0');
  sheet.getRange('F2').setValue('→').setHorizontalAlignment('center');
  sheet.getRange('G2').setValue('最終確認').setFontWeight('bold').setBackground('#e8f5e9');
  
  // 初期データの追加
  addNameTag('佐藤', sheet);
  addNameTag('鈴木', sheet);
  addNameTag('田中', sheet);
  
  addWorkItem('ホームページ更新', sheet);
  addWorkItem('バグ修正 #102', sheet);
  
  SpreadsheetApp.getUi().alert('ダッシュボードを初期化しました！');
}

// 名札を追加
function addNameTagDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('名札を追加', '名前を入力してください:', ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() == ui.Button.OK) {
    const name = response.getResponseText();
    if (name) {
      addNameTag(name);
      ui.alert('名札「' + name + '」を追加しました！');
    }
  }
}

// 名札を追加（内部処理）
function addNameTag(name, targetSheet) {
  const sheet = targetSheet || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    initializeDashboard();
    return;
  }
  
  // 名札プール列(B列)で空いている最初の行を探す
  let row = 3;
  while (sheet.getRange('B' + row).getValue() !== '') {
    row++;
  }
  
  // 名札を追加
  const cell = sheet.getRange('B' + row);
  cell.setValue(name);
  cell.setBackground('#e0e0e0');
  cell.setBorder(true, true, true, true, false, false, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  cell.setHorizontalAlignment('center');
  cell.setFontWeight('bold');
  
  // データ検証（他のセルにコピー可能にする）
  const nameTagData = sheet.getRange('B' + row);
  nameTagData.setNote('名札: ' + name);
}

// 作業項目を追加
function addWorkItemDialog() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('作業項目を追加', '作業項目名を入力してください:', ui.ButtonSet.OK_CANCEL);
  
  if (response.getSelectedButton() == ui.Button.OK) {
    const title = response.getResponseText();
    if (title) {
      addWorkItem(title);
      ui.alert('作業項目「' + title + '」を追加しました！');
    }
  }
}

// 作業項目を追加（内部処理）
function addWorkItem(title, targetSheet) {
  const sheet = targetSheet || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    initializeDashboard();
    return;
  }
  
  // 空いている行を探す
  let row = 3;
  while (sheet.getRange('A' + row).getValue() !== '') {
    row++;
  }
  
  // 作業項目名
  sheet.getRange('A' + row).setValue(title).setFontWeight('bold');
  
  // 各ステージのセル設定
  const stages = [
    { col: 'C', color: '#e3f2fd' },  // 一次作業
    { col: 'E', color: '#fff3e0' },  // ダブルチェック
    { col: 'G', color: '#e8f5e9' }   // 最終確認
  ];
  
  stages.forEach((stage, index) => {
    const cell = sheet.getRange(stage.col + row);
    cell.setBackground(stage.color);
    cell.setBorder(true, true, true, true, false, false, '#cccccc', SpreadsheetApp.BorderStyle.SOLID);
    
    // 矢印を追加（最後以外）
    if (index < stages.length - 1) {
      const arrowCol = index === 0 ? 'D' : 'F';
      sheet.getRange(arrowCol + row).setValue('→').setHorizontalAlignment('center');
    }
  });
}

// 名札をリセット（すべての名札を名札プールに戻す）
function resetNameTags() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('確認', 'すべての名札を名札プールに戻しますか？', ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  // 作業ステージ（C, E, G列）から名札を収集
  const stageCols = ['C', 'E', 'G'];
  const nameTags = [];
  
  for (let row = 3; row <= sheet.getLastRow(); row++) {
    stageCols.forEach(col => {
      const cell = sheet.getRange(col + row);
      const value = cell.getValue();
      
      if (value && col !== 'A') {  // 作業項目名以外
        // B列の名札なら収集対象外
        if (col !== 'B') {
          nameTags.push(value);
          cell.clear();  // ステージから削除
          cell.setBackground(col === 'C' ? '#e3f2fd' : col === 'E' ? '#fff3e0' : '#e8f5e9');
        }
      }
    });
  }
  
  // 名札プールに戻す
  let poolRow = 3;
  nameTags.forEach(name => {
    while (sheet.getRange('B' + poolRow).getValue() !== '') {
      poolRow++;
    }
    addNameTag(name, sheet);
  });
  
  ui.alert('名札をリセットしました！');
}

// 作業項目を全消去
function resetWorkItems() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('確認', 'すべての作業項目を削除しますか？\n（名札は名札プールに戻ります）', ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  // まず名札をリセット
  resetNameTagsSilent();
  
  // 作業項目を削除（3行目以降をクリア）
  if (sheet.getLastRow() >= 3) {
    sheet.getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn()).clear();
  }
  
  ui.alert('作業項目を削除しました！');
}

// 名札をリセット（内部処理・確認なし）
function resetNameTagsSilent() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const stageCols = ['C', 'E', 'G'];
  const nameTags = [];
  
  for (let row = 3; row <= sheet.getLastRow(); row++) {
    stageCols.forEach(col => {
      const cell = sheet.getRange(col + row);
      const value = cell.getValue();
      
      if (value) {
        nameTags.push(value);
        cell.clear();
      }
    });
  }
  
  let poolRow = 3;
  nameTags.forEach(name => {
    while (sheet.getRange('B' + poolRow).getValue() !== '') {
      poolRow++;
    }
    addNameTag(name, sheet);
  });
}

// サイドバーを表示
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('ダッシュボード操作')
    .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}

// 名札を移動
function moveNameTag(fromCell, toCell) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const fromRange = sheet.getRange(fromCell);
  const toRange = sheet.getRange(toCell);
  
  // 値と書式をコピー
  const value = fromRange.getValue();
  const background = fromRange.getBackground();
  
  toRange.setValue(value);
  toRange.setBackground(background);
  toRange.setBorder(true, true, true, true, false, false, '#000000', SpreadsheetApp.BorderStyle.SOLID);
  toRange.setHorizontalAlignment('center');
  toRange.setFontWeight('bold');
  
  // 元のセルをクリア
  fromRange.clear();
}

// セルの色を変更
function changeCellColor(cell, color) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const range = sheet.getRange(cell);
  range.setBackground(color);
}

// 作業項目を上下に移動
function moveWorkItem(row, direction) {
  captureStateToHistory();  // Undo履歴に保存
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const targetRow = direction === 'up' ? row - 1 : row + 1;
  
  if (targetRow < 3) return;  // ヘッダーより上には移動できない
  
  // 移動先が空の場合は移動しない
  if (sheet.getRange('A' + targetRow).getValue() === '') return;
  
  // 行全体を入れ替え
  const sourceRange = sheet.getRange(row + ':' + row);
  const targetRange = sheet.getRange(targetRow + ':' + targetRow);
  
  // 一時的に値を保存
  const sourceValues = sourceRange.getValues();
  const sourceBackgrounds = sourceRange.getBackgrounds();
  const sourceFontWeights = sourceRange.getFontWeights();
  const targetValues = targetRange.getValues();
  const targetBackgrounds = targetRange.getBackgrounds();
  const targetFontWeights = targetRange.getFontWeights();
  
  // 入れ替え
  sourceRange.setValues(targetValues);
  sourceRange.setBackgrounds(targetBackgrounds);
  sourceRange.setFontWeights(targetFontWeights);
  targetRange.setValues(sourceValues);
  targetRange.setBackgrounds(sourceBackgrounds);
  targetRange.setFontWeights(sourceFontWeights);
}

// ===========================================
// Undo機能の実装
// ===========================================

// 現在の状態をキャプチャして履歴に保存
function captureStateToHistory() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return;
    
    const state = {
      timestamp: new Date().getTime(),
      data: [],
      backgrounds: [],
      fontWeights: [],
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    };
    
    // 全データをキャプチャ
    if (state.lastRow >= 1) {
      const dataRange = sheet.getRange(1, 1, state.lastRow, state.lastColumn);
      state.data = dataRange.getValues();
      state.backgrounds = dataRange.getBackgrounds();
      state.fontWeights = dataRange.getFontWeights();
    }
    
    // 履歴を取得
    const properties = PropertiesService.getDocumentProperties();
    let history = [];
    const historyJson = properties.getProperty(HISTORY_KEY);
    if (historyJson) {
      history = JSON.parse(historyJson);
    }
    
    // 新しい状態を追加
    history.push(state);
    
    // 履歴の上限を管理
    if (history.length > MAX_HISTORY) {
      history.shift();
    }
    
    // 保存
    properties.setProperty(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Undo履歴のキャプチャに失敗しました:', error);
  }
}

// Undo実行
function undo() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const properties = PropertiesService.getDocumentProperties();
    const historyJson = properties.getProperty(HISTORY_KEY);
    
    if (!historyJson) {
      ui.alert('元に戻せる操作がありません');
      return;
    }
    
    const history = JSON.parse(historyJson);
    
    if (history.length === 0) {
      ui.alert('元に戻せる操作がありません');
      return;
    }
    
    // 最後の状態を取り出す
    const previousState = history.pop();
    
    // 履歴を更新
    properties.setProperty(HISTORY_KEY, JSON.stringify(history));
    
    // 状態を復元
    restoreState(previousState);
    
    ui.alert('元に戻しました！');
  } catch (error) {
    ui.alert('エラー: ' + error.toString());
  }
}

// 状態を復元
function restoreState(state) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  // シートをクリア
  sheet.clear();
  
  // データを復元
  if (state.data && state.data.length > 0) {
    const dataRange = sheet.getRange(1, 1, state.lastRow, state.lastColumn);
    dataRange.setValues(state.data);
    dataRange.setBackgrounds(state.backgrounds);
    dataRange.setFontWeights(state.fontWeights);
  }
  
  // 列幅を再設定
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 200);
  sheet.setColumnWidth(4, 50);
  sheet.setColumnWidth(5, 200);
  sheet.setColumnWidth(6, 50);
  sheet.setColumnWidth(7, 200);
}

// Undo履歴をクリア
function clearUndoHistory() {
  const properties = PropertiesService.getDocumentProperties();
  properties.deleteProperty(HISTORY_KEY);
}

// ===========================================
// 新しい機能: 色の変更と名札・作業項目の削除
// ===========================================

// 名札の色を変更
function changeNameTagColor(cell, color) {
  captureStateToHistory();  // Undo履歴に保存
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const range = sheet.getRange(cell);
  range.setBackground(color);
}

// 作業項目の色を変更
function changeWorkItemColor(row, color) {
  captureStateToHistory();  // Undo履歴に保存
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  // A列からG列までの背景色を変更
  const range = sheet.getRange(row + ':' + row);
  range.setBackground(color);
}

// 名札を削除
function deleteNameTag(cell) {
  captureStateToHistory();  // Undo履歴に保存
  
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('確認', '名札「' + cell + '」を削除しますか？', ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const range = sheet.getRange(cell);
  range.clear();
  
  ui.alert('名札を削除しました！');
}

// 作業項目を削除
function deleteWorkItem(row) {
  captureStateToHistory();  // Undo履歴に保存
  
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return;
  
  const title = sheet.getRange('A' + row).getValue();
  const response = ui.alert('確認', '作業項目「' + title + '」を削除しますか？\n（名札は名札プールに戻ります）', ui.ButtonSet.YES_NO);
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  // 名札を回収
  const stageCols = ['C', 'E', 'G'];
  const nameTags = [];
  
  stageCols.forEach(col => {
    const cell = sheet.getRange(col + row);
    const value = cell.getValue();
    if (value) {
      nameTags.push(value);
    }
  });
  
  // 行を削除
  sheet.deleteRow(row);
  
  // 名札を名札プールに戻す
  nameTags.forEach(name => {
    let poolRow = 3;
    while (sheet.getRange('B' + poolRow).getValue() !== '') {
      poolRow++;
    }
    addNameTag(name, sheet);
  });
  
  ui.alert('作業項目を削除しました！');
}
