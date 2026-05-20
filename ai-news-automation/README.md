# AI News Automation System

毎日外国のAIニュースを自動で収集・翻訳・配信するシステムです。

## 🎯 機能

- ✅ 企業公式発表を優先した重要なAIニュースの収集（3-5件/日）
- ✅ 英語ニュースの日本語翻訳
- ✅ Notionデータベースへの自動投稿
- ✅ メール通知（takucoco123@gmail.com）
- ✅ 毎日12:00-14:00（日本時間）に自動実行

## 📦 技術スタック

- **Python 3.11**
- **GitHub Actions** (自動実行)
- **Notion API** (データ保存)
- **Gmail SMTP** (メール通知)

## 🚀 セットアップ手順

### 1. GitHubリポジトリの作成

このプロジェクトをGitHubリポジトリにアップロードします。

### 2. GitHub Secretsの設定

リポジトリの Settings > Secrets and variables > Actions で以下を設定:

#### 必須のSecrets

| Secret名 | 値 | 説明 |
|---------|---|------|
| `NOTION_TOKEN` | `ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Notion Integration Token |
| `NOTION_DATABASE_ID` | `302baa6e633b800093f6fbe6b90ba5cc` | NotionデータベースID |
| `RECIPIENT_EMAIL` | `takucoco123@gmail.com` | メール受信アドレス |
| `MAIL_USERNAME` | (Gmailアドレス) | Gmail送信用アカウント |
| `MAIL_PASSWORD` | (アプリパスワード) | Gmailアプリパスワード |

### 3. Gmailアプリパスワードの取得方法

メール送信には、Gmailの「アプリパスワード」が必要です:

1. Googleアカウント設定: https://myaccount.google.com/
2. セキュリティ > 2段階認証プロセスを有効化
3. 「アプリパスワード」を検索して選択
4. アプリを選択: 「メール」
5. デバイスを選択: 「その他」→「AI News Bot」
6. 生成されたパスワードをコピーして `MAIL_PASSWORD` に設定

### 4. 自動実行スケジュール

GitHub Actionsが毎日以下の時刻に自動実行されます:

- **実行時刻**: 毎日 04:00 UTC = 日本時間 13:00
- **配信時刻**: 日本時間 13:00-13:05頃

### 5. 手動実行

GitHub Actionsタブ > "Daily AI News Automation" > "Run workflow" で手動実行可能

## 📁 ファイル構成

```
ai-news-automation/
├── ai_news_collector_v2.py      # メインスクリプト
├── news_fetcher.py               # ニュース取得モジュール
├── .github/
│   └── workflows/
│       └── daily-news.yml        # GitHub Actions設定
├── requirements.txt              # Python依存関係
└── README.md                     # このファイル
```

## 🔧 ローカルテスト

```bash
# 依存関係のインストール
pip install notion-client requests beautifulsoup4 feedparser

# 環境変数を設定
export NOTION_TOKEN="your_notion_token_here"
export NOTION_DATABASE_ID="302baa6e633b800093f6fbe6b90ba5cc"
export RECIPIENT_EMAIL="takucoco123@gmail.com"

# スクリプト実行
python ai_news_collector_v2.py
```

## 📊 配信内容

### Notionページ

- タイトル: 「AIニュースサマリー - YYYY年MM月DD日」
- タグ: AI, 自動配信
- コンテンツ:
  - 各ニュースのタイトル（絵文字付き）
  - サマリー（太字）
  - 主なポイント（箇条書き）
  - 重要性の説明（コールアウト）
  - ソースリンク

### メール通知

- 件名: 🤖 AIニュースサマリー - YYYY年MM月DD日
- 送信先: takucoco123@gmail.com
- 内容:
  - 各ニュースの概要
  - Notionページへのリンク

## 🎨 カスタマイズ

### 配信時刻を変更

`.github/workflows/daily-news.yml` の cron式を編集:

```yaml
schedule:
  - cron: '0 4 * * *'  # 04:00 UTC = 13:00 JST
```

### ニュース件数を変更

`ai_news_collector_v2.py` の `fetch_latest_ai_news()` 関数を編集

### 対象企業を追加

`news_fetcher.py` の `companies` 辞書に企業を追加

## 🔒 セキュリティ

- ✅ すべての認証情報はGitHub Secretsで管理
- ✅ Notion Integration Tokenはデータベースのみにアクセス
- ✅ メール送信にはGmailアプリパスワードを使用

## 📞 サポート

問題が発生した場合:

1. GitHub Actionsのログを確認
2. Notion Integration Tokenの権限を確認
3. Gmail アプリパスワードが正しいか確認

## 📝 ライセンス

MIT License

---

**作成日**: 2026年2月9日  
**自動配信開始日**: GitHubにプッシュ後、翌日から自動実行
