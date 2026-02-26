/**
 * 图片模态框类
 * 用于创建和管理图片查看模态框
 */
class ImageModal {
  constructor(options = {}) {
    // 默认配置
    this.defaults = {
      // 模态框容器 ID
      containerId: 'image-modal',
      // 图片元素 ID
      imageId: 'modal-image',
      // 关闭按钮 ID
      closeBtnId: 'close-modal',
      // 模态框类名
      modalClass: 'modal-backdrop',
      // 内容类名
      contentClass: 'modal-content',
      // 图片类名
      imageClass: 'modal-image',
      // 关闭按钮类名
      closeBtnClass: 'close-btn',
      // 动画持续时间(毫秒)
      animationDuration: 300,
      // 背景透明度
      backdropOpacity: 0.7,
      // 是否显示背景模糊效果
      backdropBlur: true,
      // 是否点击背景关闭
      closeOnBackdropClick: true,
      // 是否支持 ESC 键关闭
      closeOnEscape: true,
      // 打开前回调
      onBeforeOpen: null,
      // 打开后回调
      onAfterOpen: null,
      // 关闭前回调
      onBeforeClose: null,
      // 关闭后回调
      onAfterClose: null
    };

    // 合并用户配置和默认配置
    this.options = { ...this.defaults, ...options };

    // 创建模态框元素
    this.createModal();

    // 绑定事件
    this.bindEvents();

    // 初始化缩放和拖拽相关变量
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startDistance = 0;
    this.startScale = 1;
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;
  }

  /**
   * 创建模态框元素
   */
  createModal() {
    // 检查模态框是否已存在
    if ($(`#${this.options.containerId}`).length === 0) {
      // 创建模态框HTML
      const modalHtml = `
        <div id="${this.options.containerId}" class="${this.options.modalClass}">
          <div class="${this.options.contentClass}">
            <img id="${this.options.imageId}" src="" alt="大图查看" class="${this.options.imageClass}">
            <div id="${this.options.closeBtnId}" class="${this.options.closeBtnClass}"></div>
          </div>
        </div>
      `;

      // 添加到页面
      $('body').append(modalHtml);

      // 获取元素引用
      this.$modal = $(`#${this.options.containerId}`);
      this.$modalContent = this.$modal.find(`.${this.options.contentClass}`);
      this.$modalImage = this.$modal.find(`#${this.options.imageId}`);
      this.$closeBtn = this.$modal.find(`#${this.options.closeBtnId}`);

      // 应用默认样式
      this.applyDefaultStyles();
    }
  }

  /**
   * 应用默认样式
   */
  applyDefaultStyles() {
    // 模态框背景样式
    this.$modal.css({
      'position': 'fixed',
      'inset': '0',
      'background-color': `rgba(0, 0, 0, ${this.options.backdropOpacity})`,
      'z-index': '50',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'opacity': '0',
      'pointer-events': 'none',
      'transition': `opacity ${this.options.animationDuration}ms ease`
    });

    // 如果启用背景模糊
    if (this.options.backdropBlur) {
      this.$modal.css('backdrop-filter', 'blur(4px)');
    }

    // 模态框内容样式
    this.$modalContent.css({
      'position': 'relative',
      'max-width': '90vw',
      'max-height': '90vh',
      'overflow': 'hidden',
      'box-shadow': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      'transform': 'scale(0.95)',
      'transition': `transform ${this.options.animationDuration}ms ease`
    });

    // 图片样式
    this.$modalImage.css({
      'max-width': '100%',
      'max-height': '80vh',
      'object-fit': 'contain',
      'transform': 'translate(0, 0) scale(1)',
      'will-change': 'transform'
    });

    // 关闭按钮样式
    this.$closeBtn.css({
      'position': 'absolute',
      'top': '0.2rem',
      'right': '0.2rem',
      'width': '0.4rem',
      'height': '0.4rem',
      'background': 'url(../../images/close.png) no-repeat 0px 0px',
      'background-size': 'cover'
    });

    // 关闭按钮悬停效果
    this.$closeBtn.hover(
        function () {
          $(this).css('background-color', 'rgba(255, 255, 255, 0)');
        },
        function () {
          $(this).css('background-color', 'rgba(255, 255, 255, 0)');
        }
    );
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 关闭按钮点击事件
    this.$closeBtn.on('click', () => {
      this.close();
    });

    // 背景点击事件
    if (this.options.closeOnBackdropClick) {
      this.$modal.on('click', (e) => {
        // 确保点击的是背景而不是内容
        if (e.target === this.$modal[0]) {
          this.close();
        }
      });
    }

    // ESC键关闭事件
    if (this.options.closeOnEscape) {
      $(document).on('keydown', (e) => {
        if (this.isOpen() && e.key === 'Escape') {
          this.close();
        }
      });
    }

    // 触摸事件
    this.$modalImage.on('touchstart', (e) => {
      this.handleTouchStart(e);
    });
    this.$modalImage.on('touchmove', (e) => {
      this.handleTouchMove(e);
    });
    this.$modalImage.on('touchend', (e) => {
      this.handleTouchEnd(e);
    });
  }

  /**
   * 处理触摸开始事件
   */
  handleTouchStart(e) {
    if (e.originalEvent.touches.length === 2) {
      const touch1 = e.originalEvent.touches[0];
      const touch2 = e.originalEvent.touches[1];
      this.startDistance = Math.sqrt(
          Math.pow(touch2.pageX - touch1.pageX, 2) +
          Math.pow(touch2.pageY - touch1.pageY, 2)
      );
      this.startScale = this.scale;
    } else if (e.originalEvent.touches.length === 1) {
      this.startX = e.originalEvent.touches[0].pageX;
      this.startY = e.originalEvent.touches[0].pageY;
      this.isDragging = true;
    }
  }

  /**
   * 处理触摸移动事件
   */
  handleTouchMove(e) {
    e.preventDefault();
    if (e.originalEvent.touches.length === 2) {
      const touch1 = e.originalEvent.touches[0];
      const touch2 = e.originalEvent.touches[1];
      const currentDistance = Math.sqrt(
          Math.pow(touch2.pageX - touch1.pageX, 2) +
          Math.pow(touch2.pageY - touch1.pageY, 2)
      );
      const scaleFactor = currentDistance / this.startDistance;
      this.scale = this.startScale * scaleFactor;
      this.$modalImage.css('transform', `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`);
    } else if (e.originalEvent.touches.length === 1 && this.isDragging) {
      const currentX = e.originalEvent.touches[0].pageX;
      const currentY = e.originalEvent.touches[0].pageY;
      const deltaX = currentX - this.startX;
      const deltaY = currentY - this.startY;
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      this.startX = currentX;
      this.startY = currentY;
      this.$modalImage.css('transform', `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`);
    }
  }

  /**
   * 处理触摸结束事件
   */
  handleTouchEnd(e) {
    e.stopPropagation();
    this.isDragging = false;
  }

  /**
   * 打开模态框
   * @param {string} imageSrc - 图片URL
   */
  open(imageSrc) {
    // 调用打开前回调
    if (typeof this.options.onBeforeOpen === 'function') {
      this.options.onBeforeOpen(this);
    }

    // 设置图片源
    this.$modalImage.attr('src', imageSrc);

    // 重置缩放和偏移
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.$modalImage.css('transform', 'translate(0, 0) scale(1)');

    // 显示模态框
    this.$modal.css({
      'opacity': '1',
      'pointer-events': 'auto'
    });

    // 应用缩放动画
    setTimeout(() => {
      this.$modalContent.css('transform', 'scale(1)');
    }, 10);

    // 阻止页面滚动
    $('body').css('overflow', 'hidden');

    // 调用打开后回调
    setTimeout(() => {
      if (typeof this.options.onAfterOpen === 'function') {
        this.options.onAfterOpen(this);
      }
    }, this.options.animationDuration);
  }

  /**
   * 关闭模态框
   */
  close() {
    // 调用关闭前回调
    if (typeof this.options.onBeforeClose === 'function') {
      this.options.onBeforeClose(this);
    }

    // 应用缩放动画
    this.$modalContent.css('transform', 'scale(0.95)');

    // 隐藏模态框
    setTimeout(() => {
      this.$modal.css({
        'opacity': '0',
        'pointer-events': 'none'
      });
    }, 200);

    // 恢复页面滚动
    $('body').css('overflow', 'auto');

    // 调用关闭后回调
    setTimeout(() => {
      if (typeof this.options.onAfterClose === 'function') {
        this.options.onAfterClose(this);
      }
    }, this.options.animationDuration);
  }

  /**
   * 检查模态框是否打开
   * @returns {boolean} - 如果打开返回true，否则返回false
   */
  isOpen() {
    return this.$modal.css('opacity') === '1';
  }

  /**
   * 更新图片
   * @param {string} imageSrc - 新图片URL
   */
  updateImage(imageSrc) {
    this.$modalImage.attr('src', imageSrc);
  }

  /**
   * 销毁模态框
   */
  destroy() {
    // 解绑事件
    this.$closeBtn.off('click');
    this.$modal.off('click');
    $(document).off('keydown');
    this.$modalImage.off('touchstart');
    this.$modalImage.off('touchmove');
    this.$modalImage.off('touchend');

    // 移除元素
    this.$modal.remove();

    // 恢复页面滚动
    $('body').css('overflow', 'auto');
  }
}

// 为jQuery添加插件方法
$.fn.imageModal = function (options) {
  // 创建模态框实例
  const modal = new ImageModal(options);

  // 为元素绑定点击事件
  this.on('click', function () {
    const imageSrc = $(this).data('src') || $(this).attr('src');
    if (imageSrc) {
      modal.open(imageSrc);
    }
  });

  // 返回实例以便链式调用
  return modal;
};