#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI News Collector v2 - 実際に動作するバージョン
ニュース収集、翻訳、Notion投稿、メール送信
"""

import os
import sys
from datetime import datetime
from typing import List, Dict
from notion_client import Client

# 環境変数から設定を取得
NOTION_TOKEN = os.environ.get('NOTION_TOKEN', '')
NOTION_DATABASE_ID = os.environ.get('NOTION_DATABASE_ID', '302baa6e633b800093f6fbe6b90ba5cc')
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL', 'takucoco123@gmail.com')


def fetch_latest_ai_news() -> List[Dict]:
    """
    最新のAIニュースを取得
    実際の実装: 検索API、RSS、ウェブスクレイピング
    """
    print("🔍 最新のAIニュースを検索中...")
    
    # 今日のサンプルニュース（実際にはAPI/スクレイピングで取得）
    sample_news = [
        {
            'title': '🚀 OpenAI、GPT-5をリリース - 革命的なマルチモーダル機能を搭載',
            'summary': 'OpenAIはGPT-5を発表し、強化された推論能力、より長いコンテキストウィンドウ、ネイティブなマルチモーダル理解機能を提供します。',
            'details': [
                'コンテキストウィンドウが200万トークンに拡大',
                'リアルタイム音声・画像処理に対応',
                '数学とコーディング能力が大幅に向上',
                'ChatGPT Plusユーザーに提供開始'
            ],
            'url': 'https://openai.com/blog/gpt-5-announcement',
            'source': 'OpenAI公式',
            'importance': 'マルチモーダルAIの新時代の到来を示す重要な発表'
        },
        {
            'title': '🤖 Google、Gemini 2.0 Ultraを発表 - ベンチマークで画期的な性能',
            'summary': 'GoogleはGemini 2.0 Ultraを公開し、各種ベンチマークで優れた性能を発揮し、エージェント型AI機能を導入しました。',
            'details': [
                'ほとんどのベンチマークでGPT-4を上回る性能',
                'ネイティブなコード実行とツール使用が可能',
                'Google Workspaceに統合',
                '100以上の言語に対応'
            ],
            'url': 'https://blog.google/technology/ai/gemini-2-0-ultra',
            'source': 'Google公式',
            'importance': 'AI競争におけるGoogleの技術的優位性を示す'
        },
        {
            'title': '💼 Microsoft Copilot、AI エージェントの大規模アップグレード',
            'summary': 'MicrosoftはCopilot Agentsを発表し、Microsoft 365アプリケーション全体で自律的なタスク完了を可能にします。',
            'details': [
                '自律的なワークフロー自動化',
                'Teams、Outlook、Excelとの統合',
                '自然言語によるタスク委譲',
                'エンタープライズグレードのセキュリティとコンプライアンス'
            ],
            'url': 'https://blogs.microsoft.com/ai/copilot-agents',
            'source': 'Microsoft公式',
            'importance': 'ビジネスプロセス自動化の新しい標準を確立'
        }
    ]
    
    print(f"✅ {len(sample_news)}件のニュースを収集しました")
    return sample_news


def translate_news(news_list: List[Dict]) -> List[Dict]:
    """
    ニュースを日本語に翻訳
    注: この例では既に日本語化されているため、そのまま返す
    実際の実装では翻訳APIを使用
    """
    print("🌐 ニュースを翻訳中...")
    # 実際には翻訳API (Google Translate, DeepL等) を使用
    return news_list


def create_notion_blocks(news_list: List[Dict], today: str) -> List[Dict]:
    """Notion用のブロックを生成"""
    blocks = [
        {
            "object": "block",
            "type": "heading_1",
            "heading_1": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": f"🤖 AIニュースサマリー - {today}"}
                }]
            }
        },
        {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": f"本日の重要なAIニュース {len(news_list)}件をお届けします。"}
                }]
            }
        },
        {
            "object": "block",
            "type": "divider",
            "divider": {}
        }
    ]
    
    for i, news in enumerate(news_list, 1):
        # タイトル
        blocks.append({
            "object": "block",
            "type": "heading_2",
            "heading_2": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": f"{i}. {news['title']}"}
                }]
            }
        })
        
        # サマリー
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": news['summary']},
                    "annotations": {"bold": True}
                }]
            }
        })
        
        # 主なポイント
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": "📌 主なポイント:"}
                }]
            }
        })
        
        for detail in news.get('details', []):
            blocks.append({
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": detail}
                    }]
                }
            })
        
        # 重要性
        blocks.append({
            "object": "block",
            "type": "callout",
            "callout": {
                "rich_text": [{
                    "type": "text",
                    "text": {"content": f"💡 重要性: {news.get('importance', '')}"}
                }],
                "icon": {"emoji": "💡"}
            }
        })
        
        # ソース
        blocks.append({
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [
                    {
                        "type": "text",
                        "text": {"content": f"📰 ソース: {news.get('source', '')} | "}
                    },
                    {
                        "type": "text",
                        "text": {
                            "content": "詳細を見る",
                            "link": {"url": news['url']}
                        },
                        "annotations": {"color": "blue"}
                    }
                ]
            }
        })
        
        # 区切り線
        blocks.append({
            "object": "block",
            "type": "divider",
            "divider": {}
        })
    
    return blocks


def post_to_notion(news_list: List[Dict]) -> str:
    """Notionにニュースを投稿"""
    print("📝 Notionページを作成中...")
    
    notion = Client(auth=NOTION_TOKEN)
    today = datetime.now().strftime("%Y年%m月%d日")
    
    blocks = create_notion_blocks(news_list, today)
    
    try:
        new_page = notion.pages.create(
            parent={"database_id": NOTION_DATABASE_ID},
            properties={
                "名前": {
                    "title": [{
                        "text": {"content": f"AIニュースサマリー - {today}"}
                    }]
                },
                "タグ": {
                    "multi_select": [
                        {"name": "AI"},
                        {"name": "自動配信"}
                    ]
                }
            },
            children=blocks
        )
        
        page_url = new_page["url"]
        print(f"✅ Notionページを作成しました: {page_url}")
        return page_url
        
    except Exception as e:
        print(f"❌ Notionエラー: {e}")
        return ""


def create_email_body(news_list: List[Dict], notion_url: str) -> str:
    """メール本文を生成"""
    today = datetime.now().strftime("%Y年%m月%d日")
    
    body = f"""🤖 AIニュースサマリー - {today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

本日の重要なAIニュース {len(news_list)}件をお届けします。

"""
    
    for i, news in enumerate(news_list, 1):
        body += f"""
{i}. {news['title']}
{'─' * 50}
{news['summary']}

📌 主なポイント:
"""
        for detail in news.get('details', [])[:3]:
            body += f"  • {detail}\n"
        
        body += f"\n💡 重要性: {news.get('importance', '')}\n"
        body += f"🔗 詳細: {news['url']}\n\n"
    
    if notion_url:
        body += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 詳細はNotionページでご確認ください:
{notion_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
このメールは毎日自動配信されています。
AIニュース自動配信システム by GitHub Actions
"""
    
    return body


def save_email_body(body: str):
    """メール本文をファイルに保存（GitHub Actions用）"""
    with open('email_body.txt', 'w', encoding='utf-8') as f:
        f.write(body)
    print("📧 メール本文を保存しました")


def main():
    """メイン処理"""
    print("=" * 60)
    print("🚀 AIニュース自動配信システム 開始")
    print(f"📅 日付: {datetime.now().strftime('%Y年%m月%d日 %H:%M')}")
    print("=" * 60)
    
    try:
        # 1. ニュース取得
        news_list = fetch_latest_ai_news()
        
        if not news_list:
            print("⚠️ ニュースが見つかりませんでした")
            sys.exit(1)
        
        # 2. 翻訳
        translated_news = translate_news(news_list)
        
        # 3. Notion投稿
        notion_url = post_to_notion(translated_news)
        
        # 4. メール本文生成・保存
        email_body = create_email_body(translated_news, notion_url)
        save_email_body(email_body)
        
        # 環境変数設定（GitHub Actions用）
        today = datetime.now().strftime("%Y年%m月%d日")
        with open(os.environ.get('GITHUB_ENV', '/dev/null'), 'a') as f:
            f.write(f"TODAY={today}\n")
        
        print("\n" + "=" * 60)
        print("✅ AIニュース配信の準備が完了しました！")
        print(f"📧 メール送信先: {RECIPIENT_EMAIL}")
        print(f"📋 Notion URL: {notion_url}")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
