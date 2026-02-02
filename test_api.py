#!/usr/bin/env python3
"""
测试 AI 图片生成 API
用法: python test_api.py
"""

import requests
import time
import base64
import os

# API 配置
API_BASE_URL = "https://api.bltcy.ai"
API_KEY = os.environ.get("AI_API_KEY", "YOUR_API_KEY_HERE")  # 替换成你的 API Key

# SSR 级别的一个 prompt 示例
TEST_PROMPT = "A cat, CYBERPUNK NEON style, as a mass-murdering villain in a sci-fi movie, neon lights, dark atmosphere, high tech weapons, menacing pose, maintain the original pet's appearance and features, high quality, detailed"

# 测试图片 (一个简单的 1x1 像素红色图片的 base64)
# 实际测试时请替换成真实的宠物图片
TEST_IMAGE_BASE64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEPwC/AB//2Q=="


def test_nano_banana_2():
    """测试 nano-banana-2 模型"""
    print("=" * 50)
    print("测试模型: nano-banana-2")
    print("=" * 50)

    url = f"{API_BASE_URL}/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": TEST_PROMPT,
        "model": "nano-banana-2",
        "response_format": "url",
        "aspect_ratio": "1:1",
        "image": [TEST_IMAGE_BASE64]
    }

    print(f"Prompt: {TEST_PROMPT[:80]}...")
    print(f"开始调用 API...")

    start_time = time.time()

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        elapsed = time.time() - start_time

        print(f"响应状态码: {response.status_code}")
        print(f"响应时间: {elapsed:.2f} 秒")

        if response.status_code == 200:
            data = response.json()
            if data.get("data") and data["data"][0].get("url"):
                print(f"✅ 成功！图片 URL: {data['data'][0]['url'][:100]}...")
            else:
                print(f"❌ 响应异常: {data}")
        else:
            print(f"❌ 错误: {response.text}")

    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"❌ 超时！已等待 {elapsed:.2f} 秒")
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ 异常: {e} (已等待 {elapsed:.2f} 秒)")


def test_sora_image_vip():
    """测试 sora_image-vip 模型"""
    print("\n" + "=" * 50)
    print("测试模型: sora_image-vip")
    print("=" * 50)

    url = f"{API_BASE_URL}/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": TEST_PROMPT,
        "model": "sora_image-vip",
        "response_format": "url",
        "aspect_ratio": "1:1",
        "image": [TEST_IMAGE_BASE64]
    }

    print(f"Prompt: {TEST_PROMPT[:80]}...")
    print(f"开始调用 API...")

    start_time = time.time()

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        elapsed = time.time() - start_time

        print(f"响应状态码: {response.status_code}")
        print(f"响应时间: {elapsed:.2f} 秒")

        if response.status_code == 200:
            data = response.json()
            if data.get("data") and data["data"][0].get("url"):
                print(f"✅ 成功！图片 URL: {data['data'][0]['url'][:100]}...")
            else:
                print(f"❌ 响应异常: {data}")
        else:
            print(f"❌ 错误: {response.text}")

    except requests.exceptions.Timeout:
        elapsed = time.time() - start_time
        print(f"❌ 超时！已等待 {elapsed:.2f} 秒")
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ 异常: {e} (已等待 {elapsed:.2f} 秒)")


if __name__ == "__main__":
    print("AI 图片生成 API 测试")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"API Key: {API_KEY[:10]}..." if len(API_KEY) > 10 else "未设置 API Key!")
    print()

    # 测试两个模型
    test_nano_banana_2()
    test_sora_image_vip()

    print("\n" + "=" * 50)
    print("测试完成")
    print("=" * 50)
