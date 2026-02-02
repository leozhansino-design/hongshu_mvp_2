'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface ImageCropperProps {
  image: string;
  shape: 'circle' | 'square';
  size: number;
  onConfirm: (croppedImage: string) => void;
  onCancel: () => void;
  title: string;
  rarity: string;
  rarityColor: string;
}

export function ImageCropper({
  image,
  shape,
  size,
  onConfirm,
  onCancel,
  title,
  rarity,
  rarityColor,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState(280);

  // 加载图片获取尺寸
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    img.src = image;
  }, [image]);

  // 触摸缩放相关
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 鼠标/触摸事件处理
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return; // 触摸用 touch 事件处理
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerType === 'touch') return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // 触摸事件
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      if (distance && lastTouchDistance) {
        const delta = distance - lastTouchDistance;
        setScale(prev => Math.min(Math.max(prev + delta * 0.005, 0.5), 3));
      }
      setLastTouchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  // 滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // 生成裁剪后的图片
  const handleConfirm = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 计算裁剪区域
      const displayScale = containerSize / Math.min(imageSize.width, imageSize.height);
      const scaledWidth = imageSize.width * displayScale * scale;
      const scaledHeight = imageSize.height * displayScale * scale;

      // 裁剪框在容器中心
      const cropCenterX = containerSize / 2;
      const cropCenterY = containerSize / 2;

      // 图片中心相对于裁剪框的偏移
      const imgCenterX = containerSize / 2 + position.x;
      const imgCenterY = containerSize / 2 + position.y;

      // 裁剪框左上角在图片上的位置
      const srcX = ((cropCenterX - imgCenterX) / scaledWidth + 0.5) * img.width;
      const srcY = ((cropCenterY - imgCenterY) / scaledHeight + 0.5) * img.height;
      const srcSize = (containerSize * 0.7) / scaledWidth * img.width;

      // 圆形裁剪
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      } else {
        // 圆角矩形裁剪
        const radius = 40;
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, size, size);

      // 添加装饰
      if (shape === 'circle') {
        // 小红书头像：添加彩色边框
        ctx.strokeStyle = rarityColor;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // 微信头像：添加渐变遮罩和文字
        const gradient = ctx.createLinearGradient(0, size * 0.6, 0, size);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // 稀有度标签
        ctx.fillStyle = rarityColor;
        ctx.beginPath();
        ctx.roundRect(size / 2 - 40, 20, 80, 30, 15);
        ctx.fill();

        ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rarity, size / 2, 35);

        // 标题
        ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;
        ctx.fillText(title.length > 8 ? title.slice(0, 8) + '...' : title, size / 2, size - 40);
      }

      onConfirm(canvas.toDataURL('image/png'));
    };

    img.src = image;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
    >
      {/* 标题 */}
      <div className="text-white text-center mb-4">
        <h3 className="text-lg font-semibold mb-1">
          调整头像位置
        </h3>
        <p className="text-sm text-gray-400">
          拖动图片调整位置，双指缩放
        </p>
      </div>

      {/* 裁剪区域 */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-gray-900"
        style={{
          width: containerSize,
          height: containerSize,
          borderRadius: shape === 'circle' ? '50%' : 20,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 图片 */}
        <div
          className="absolute cursor-move"
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          <img
            src={image}
            alt="裁剪预览"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* 裁剪框指示 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `2px dashed ${rarityColor}`,
            borderRadius: shape === 'circle' ? '50%' : 20,
          }}
        />
      </div>

      {/* 缩放滑块 */}
      <div className="w-64 mt-6 flex items-center gap-3">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
      </div>

      {/* 按钮 */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-full bg-gray-700 text-white font-medium hover:bg-gray-600 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-3 rounded-full text-white font-medium transition-colors"
          style={{ backgroundColor: rarityColor }}
        >
          确认保存
        </button>
      </div>
    </motion.div>
  );
}
