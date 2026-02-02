// lib/analytics.ts

export const EVENTS = {
  PAGE_VIEW: 'page_view',
  UPLOAD_START: 'upload_start',
  UPLOAD_SUCCESS: 'upload_success',
  UPLOAD_FAIL: 'upload_fail',
  QUESTION_START: 'question_start',
  QUESTION_ANSWER: 'question_answer',
  QUESTION_COMPLETE: 'question_complete',
  GACHA_START: 'gacha_start',
  GACHA_RESULT: 'gacha_result',
  SHARE_CLICK: 'share_click',
  SHARE_IMAGE_DOWNLOAD: 'share_image_download',
  CDKEY_INPUT: 'cdkey_input',
  CDKEY_VERIFY: 'cdkey_verify',
  CDKEY_SUCCESS: 'cdkey_success',
  CDKEY_FAIL: 'cdkey_fail',
  RESULT_VIEW: 'result_view',
  RETRY_CLICK: 'retry_click',
  BTN_PAY_CLICK: 'btn_pay_click', // 点击获取卡密
  API_GENERATION_SUCCESS: 'api_generation_success',
  API_GENERATION_FAIL: 'api_generation_fail',
};

export async function track(eventName: string, data?: Record<string, unknown>) {
  console.log(`📊 埋点: ${eventName}`, data); // 测试版本打印

  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_data: data,
        page_url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error('Track error:', e);
  }
}

// 页面访问追踪
export function trackPageView(pageName: string) {
  track(EVENTS.PAGE_VIEW, { page: pageName });
}
