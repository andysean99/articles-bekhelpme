# 本機 Claude Code 收尾 prompt

**為什麼需要本機**：claude.ai 的 Google Drive 連接器只有 8 個工具（copy / create / download /
read / metadata / permissions / search / list_recent），**沒有 delete、沒有就地 update**。
這是連接器的能力上限，不是某個 session 的限制——換 Cowork 或另開遠端 session 拿到的是同一組工具。

**本機為什麼可以**：Obsidian Vault 是 Google Drive Desktop 同步的本機資料夾，
那些檔案就是普通檔案，刪除與覆寫都是一般檔案操作，Drive 自動同步。

---

## 用法

在你自己電腦上開 Claude Code，把下面整段貼進去。

---

```
幫我做四件收尾。全部自動，做完給我一份驗證報告。

## 任務 0 — 先驗證兩個網址真的活著（最重要，先做）

curl 或開瀏覽器抓這兩個網址，帶 ?x=1 避開 CDN 快取：
  https://articles.bekhelpme.com/measuring-the-half-ai-does-better?x=1
  https://articles.bekhelpme.com/measuring-the-half-ai-does-better-cn?x=1

每個確認四件事，用抓回來的 HTML 檢查，不要憑感覺：
1. HTTP 200
2. 內容含「我們正在衡量」（繁體版）或「我们正在衡量」（簡體版）
3. `grep -o 'class="ent"' | wc -l` 應為 48，且 `class="ent" href=` 同樣是 48
4. 簡體版額外檢查：`grep -c '指针'` 必須是 0，`grep -o '指标' | wc -l` 應為 31

如果 HTTP 404：等 60 秒重試一次。第二次仍 404 就停下來告訴我，
那代表 Vercel 專案沒接到 main（commit 0282715）或建置失敗，先不要做後面三件。

## 背景
我的 Obsidian Vault 同步在 Google Drive Desktop。先找到 vault 根目錄——
它底下應該有 `00_SYSTEM` 和 `Projects` 兩個資料夾。
常見位置（依你的系統擇一搜尋，不要問我，自己找）：
- Windows: G:\My Drive\Obsidian Vault、C:\Users\<你>\Google Drive\Obsidian Vault、
  C:\Users\<你>\My Drive\Obsidian Vault
- macOS: ~/Google Drive/My Drive/Obsidian Vault、
  ~/Library/CloudStorage/GoogleDrive-*/My Drive/Obsidian Vault

找到後把絕對路徑印出來確認，再往下做。

## 任務 1 — 合併 eval-scoreboard.json

目標檔：<vault>/00_SYSTEM/AI/eval-scoreboard.json（目前 14 列，約 3.9 KB）

要併進去的 10 列在這個 repo 裡：
  https://github.com/andysean99/articles-bekhelpme
  路徑 work/eval-scoreboard-append-2026-07-29.json（main 分支）

做法：
1. clone 或 pull 那個 repo 到暫存目錄（若你本機已有 C:\dev\articles-bekhelpme 就 git pull）
2. 讀 work/eval-scoreboard-append-2026-07-29.json（10 列）
3. 讀 vault 的 eval-scoreboard.json，**先確認它是 14 列**，不是就停下來問我
4. 先備份成 eval-scoreboard.backup-YYYYMMDD.json
5. 把 10 列 append 到 14 列後面（順序：舊的在前），寫回原檔
6. 驗證：json.load 成功、總數 24、前 14 列與備份的前 14 列逐欄相同、
   每列都有這 9 個欄位 project/task_type/model/model_version/first_try_pass/
   retries/cost_estimate/failure_mode/date

**不要新建檔案。**一定要覆寫原本那個 eval-scoreboard.json，
因為它的 Drive file ID（1ISyGXhj5quUNxjghHrqwxnR9G29MGW99）是路由邏輯的唯一權威來源，
新建一個同名檔會變成 stale fork——那正是任務 2 要清掉的東西。

## 任務 2 — 刪兩份 stale 檔

1. <vault>/Projects/量測與開發紀律 2026-07/build-discipline.skill
   （v0.1 舊版，已被 v0.2 取代）

2. <vault>/Projects/Bekhelpme websites/eval-scoreboard.json
   （2026-07-23 的舊 fork，約 3.5 KB）

⚠️ 第 2 個要小心：vault 裡有兩個檔案叫 eval-scoreboard.json。
要刪的是 **Projects/Bekhelpme websites/** 底下那份，
**不是** 任務 1 剛更新的 **00_SYSTEM/AI/** 那份。
刪之前先印出兩個檔的完整路徑、大小、修改日期給我看，確認無誤再刪。
要刪的那份：約 3.5 KB、修改日 2026-07-23。
不能刪的那份：任務 1 完成後約 10.6 KB、修改日今天。

刪法用移到系統資源回收桶（Windows: Remove-Item；macOS: trash 或 mv 到 ~/.Trash），
不要用永久刪除。

## 任務 3 — 填 handoff 的第一個動作時間

檔案：<vault>/Projects/量測與開發紀律 2026-07/HANDOFF-燈塔文摘上線-v3-2026-07-29.md

最後一節「第一個動作」有一行 `**時間**：______`
把底線換成現在的時間戳（格式 YYYY-MM-DD HH:MM）。

## 最後給我驗證報告

- 兩個網址的 HTTP 狀態碼、.ent 計數、簡體版的 指针/指标 計數
- vault 絕對路徑
- eval-scoreboard.json：合併前後列數、檔案大小、備份檔路徑
- 兩個被刪的檔：完整路徑 ＋ 刪除前的大小與修改日
- **00_SYSTEM/AI/eval-scoreboard.json 仍然存在**且是 24 列（這是最重要的一項）
- handoff 填入的時間戳

任何一步不確定就停下來問，不要猜。
```

---

## 順帶一提

任務 1 的 append 檔已經在 repo 的 main 分支上，所以本機 session 不需要你傳任何檔案給它——
它自己 `git pull` 就有。
