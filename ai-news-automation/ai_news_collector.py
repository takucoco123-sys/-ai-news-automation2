#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI News Automation System
毎日外国のAIニュースを収集・翻訳・配信
"""

import os
import requests
import json
from datetime import datetime, timedelta
from notion_client import Client
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict

# 環境変数から設定を取得
NOTION_TOKEN = os.environ.get('NOTION_TOKEN')
NOTION_DATABASE_ID = os.environ.get('NOTION_DATABASE_ID')
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'ai-news-bot@notification.com')


class AINewsCollector:
    """AIニュース収集・翻訳・配信システム"""
    
    def __init__(self):
        self.notion = Client(auth=NOTION_TOKEN) if NOTION_TOKEN else None
        self.today = datetime.now().strftime("%Y年%m月%d日")
        
    def search_ai_news(self) -> List[Dict]:
        """
        最新のAIニュースを検索
        企業公式発表を優先、重要ニュースのみ3-5件
        """
        print("🔍 AIニュースを検索中...")
        
        # 検索クエリ: 企業公式発表を優先
        search_queries = [
            "OpenAI announcement OR release",
            "Google AI Gemini announcement",
            "Microsoft Copilot announcement",
            "Anthropic Claude announcement",
            "Meta AI Llama announcement",
            "Apple Intelligence announcement"
        ]
        
        all_news = []
        
        # 各企業の最新発表を検索
        for query in search_queries[:3]:  # 最大3社分を検索
            try:
                # Google検索APIの代わりに、主要なAI企業のブログ/発表を直接チェック
                results = self._search_news(query)
                if results:
                    all_news.extend(results)
            except Exception as e:
                print(f"検索エラー ({query}): {e}")
                continue
        
        # 重要度でソート・フィルター（3-5件）
        filtered_news = self._filter_important_news(all_news, max_count=5)
        print(f"✅ {len(filtered_news)}件のニュースを収集しました")
        
        return filtered_news
    
    def _search_news(self, query: str) -> List[Dict]:
        """実際のニュース検索（モックデータ）"""
        # 注: 実際の実装では、News APIやRSSフィードを使用
        # ここでは構造を示すためのモック
        return []
    
    def _filter_important_news(self, news_list: List[Dict], max_count: int = 5) -> List[Dict]:
        """重要なニュースのみをフィルター"""
        # 重要度スコアリング（企業公式発表を優先）
        priority_keywords = [
            'announcement', 'release', 'launch', 'introduces',
            'official', 'unveils', 'breakthrough', 'new model'
        ]
        
        scored_news = []
        for news in news_list:
            score = 0
            title = news.get('title', '').lower()
            
            # 公式発表キーワードでスコアリング
            for keyword in priority_keywords:
                if keyword in title:
                    score += 1
            
            scored_news.append({
                'news': news,
                'score': score
            })
        
        # スコアでソートして上位のみ返す
        scored_news.sort(key=lambda x: x['score'], reverse=True)
        return [item['news'] for item in scored_news[:max_count]]
    
    def translate_to_japanese(self, text: str) -> str:
        """英語を日本語に翻訳（簡易版）"""
        # 注: 実際の実装では、翻訳APIを使用
        return text
    
    def create_notion_page(self, news_list: List[Dict]) -> str:
        """Notionページを作成"""
        if not self.notion or not NOTION_DATABASE_ID:
            print("⚠️ Notion設定が見つかりません")
            return ""
        
        print("📝 Notionページを作成中...")
        
        # ブロック作成
        blocks = self._create_notion_blocks(news_list)
        
        try:
            # ページ作成
            new_page = self.notion.pages.create(
                parent={"database_id": NOTION_DATABASE_ID},
                properties={
                    "名前": {
                        "title": [
                            {
                                "text": {
                                    "content": f"AIニュースサマリー - {self.today}"
                                }
                            }
                        ]
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
            
            page_url = new_page.get("url", "")
            print(f"✅ Notionページを作成しました: {page_url}")
            return page_url
            
        except Exception as e:
            print(f"❌ Notionページ作成エラー: {e}")
            return ""
    
    def _create_notion_blocks(self, news_list: List[Dict]) -> List[Dict]:
        """Notion用のブロックを作成"""
        blocks = [
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": f"🤖 AIニュースサマリー - {self.today}"}
                    }]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": f"本日の重要なAIニュース {len(news_list)}件"}
                    }]
                }
            },
            {
                "object": "block",
                "type": "divider",
                "divider": {}
            }
        ]
        
        # 各ニュースのブロックを追加
        for i, news in enumerate(news_list, 1):
            blocks.extend(self._create_news_block(news, i))
        
        return blocks
    
    def _create_news_block(self, news: Dict, index: int) -> List[Dict]:
        """個別ニュースのブロックを作成"""
        blocks = [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": f"{index}. {news.get('title', 'タイトルなし')}"}
                    }]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{
                        "type": "text",
                        "text": {"content": news.get('summary', '')},
                        "annotations": {"bold": True}
                    }]
                }
            }
        ]
        
        # 詳細ポイント
        if news.get('details'):
            for detail in news['details']:
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
        
        # ソースURL
        if news.get('url'):
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {"content": "🔗 ソース: "}
                        },
                        {
                            "type": "text",
                            "text": {
                                "content": news['url'],
                                "link": {"url": news['url']}
                            }
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
    
    def send_email_notification(self, news_list: List[Dict], notion_url: str = ""):
        """メール通知を送信"""
        if not RECIPIENT_EMAIL:
            print("⚠️ 受信メールアドレスが設定されていません")
            return
        
        print(f"📧 メール通知を送信中: {RECIPIENT_EMAIL}")
        
        # メール本文を作成
        email_body = self._create_email_body(news_list, notion_url)
        
        # メール送信（GitHub Actionsの制限により、実際にはWebhook等を使用）
        print("✅ メール通知の準備が完了しました")
        print(f"受信者: {RECIPIENT_EMAIL}")
        print(f"\n--- メール本文プレビュー ---\n{email_body}\n---")
    
    def _create_email_body(self, news_list: List[Dict], notion_url: str) -> str:
        """メール本文を作成"""
        body = f"""
🤖 AIニュースサマリー - {self.today}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

本日の重要なAIニュース {len(news_list)}件をお届けします。

"""
        
        # 各ニュースを追加
        for i, news in enumerate(news_list, 1):
            body += f"""
{i}. {news.get('title', 'タイトルなし')}
---
{news.get('summary', '')}

"""
            if news.get('details'):
                for detail in news['details'][:3]:  # 最大3つまで
                    body += f"  • {detail}\n"
            
            if news.get('url'):
                body += f"\n🔗 詳細: {news['url']}\n"
            
            body += "\n"
        
        # Notion URLを追加
        if notion_url:
            body += f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 詳細はNotionページでご確認ください:
{notion_url}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
このメールは自動配信されています。
"""
        
        return body
    
    def run(self):
        """メイン実行"""
        print("=" * 50)
        print("🚀 AIニュース自動配信システム 開始")
        print(f"📅 日付: {self.today}")
        print("=" * 50)
        
        try:
            # 1. ニュース収集
            news_list = self.search_ai_news()
            
            if not news_list:
                print("⚠️ ニュースが見つかりませんでした")
                return
            
            # 2. Notionページ作成
            notion_url = self.create_notion_page(news_list)
            
            # 3. メール通知送信
            self.send_email_notification(news_list, notion_url)
            
            print("\n" + "=" * 50)
            print("✅ AIニュース配信が完了しました！")
            print("=" * 50)
            
        except Exception as e:
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()


def main():
    """メイン関数"""
    collector = AINewsCollector()
    collector.run()


if __name__ == "__main__":
    main()
