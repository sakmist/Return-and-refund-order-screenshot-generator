(function () {
  const { createApp } = Vue;

  function pad(value) {
    return value.toString().padStart(2, '0');
  }

  function getCurrentTime() {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  const NAME_KEYWORDS = /(?:收[件貨]人|联系人|聯絡人|姓名)/i;
  const PHONE_KEYWORDS = /(?:电话|手機|手机|联系方式|聯絡電話|Tel)/i;
  const ADDRESS_KEYWORDS = /(?:返厂地址|退货地址|收货地址|寄件地址|详细地址|地址)/i;
  const STOP_WORDS = /^(备注|請|请|如有|若有|您|麻烦|寄出|记得|快递|留言|单号|谢谢)/;

  function normalizeLines(text) {
    return text
      .replace(/\r/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  function parseAddressText(raw) {
    if (!raw) {
      return { name: '', phone: '', address: '' };
    }
    const lines = normalizeLines(raw);
    if (!lines.length) {
      return { name: '', phone: '', address: '' };
    }

    let phone = '';
    let name = '';
    let address = '';

    lines.forEach(line => {
      if (!phone) {
        const labelled = line.match(new RegExp(`${PHONE_KEYWORDS.source}[:：]*\\s*(1\\d{10})`, 'i'));
        phone = labelled && labelled[1] ? labelled[1] : '';
      }
      if (!phone) {
        const loose = line.match(/(1\d{10})/);
        phone = loose ? loose[1] : '';
      }
      if (!name) {
        const labelled = line.match(new RegExp(`${NAME_KEYWORDS.source}[:：]*\\s*([^\\s,，]+)`, 'i'));
        name = labelled && labelled[1] ? labelled[1].trim() : '';
      }
      if (!address && ADDRESS_KEYWORDS.test(line)) {
        const value = line.split(/[:：]/).slice(1).join(':').trim() ||
          line.replace(ADDRESS_KEYWORDS, '').replace(/[:：]/g, '').trim();
        address = value;
      }
    });

    if (!address) {
      for (let i = 0; i < lines.length; i += 1) {
        if (ADDRESS_KEYWORDS.test(lines[i])) {
          let collected = lines[i].split(/[:：]/).slice(1).join(':').trim();
          if (!collected) {
            collected = lines[i].replace(ADDRESS_KEYWORDS, '').replace(/[:：]/g, '').trim();
          }
          for (let j = i + 1; j < lines.length; j += 1) {
            const next = lines[j];
            if (ADDRESS_KEYWORDS.test(next) || NAME_KEYWORDS.test(next) || PHONE_KEYWORDS.test(next) || STOP_WORDS.test(next)) {
              break;
            }
            collected += ` ${next}`;
          }
          address = collected.trim();
          break;
        }
      }
    }

    if (!name) {
      const firstTokens = lines[0].split(/[\s,，]+/).filter(Boolean);
      if (firstTokens.length) {
        name = firstTokens[0];
      }
    }

    if (!address) {
      const candidate = lines.find(line => line.length > 8 && !NAME_KEYWORDS.test(line) && !PHONE_KEYWORDS.test(line));
      address = candidate || lines[lines.length - 1];
    }

    return { name, phone, address };
  }

  createApp({
    data() {
      return {
        data1: '6天23小时',
        data2: '明天 17:00-18:00',
        data3: '李白 18112349876',
        data4: '广东省深圳市小龙区大沙田街道第十五工业区9栋4楼401',
        data5: '王大钊 18012349876',
        data6: '南京市 北方路 乐药区 云朵花园 20幢三单元403',
        data7: '39',
        data8: '40',
        data9: '1',
        data10: getCurrentTime(),
        isCapturing: false,
      };
    },
    methods: {
      async screenshot() {
        if (this.isCapturing) {
          return;
        }
        const target = this.$refs.screen;
        if (!target) {
          console.error('画面节点未找到');
          return;
        }
        if (typeof html2canvas !== 'function') {
          alert('缺少截图依赖：html2canvas');
          return;
        }
        try {
          this.isCapturing = true;
          const scale = Math.max(window.devicePixelRatio || 1, 2);
          const rect = target.getBoundingClientRect();
          const canvas = await html2canvas(target, {
            backgroundColor: null,
            scale,
            width: rect.width,
            height: rect.height,
            x: rect.left,
            y: rect.top,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 0,
            scrollX: 0,
            scrollY: 0,
          });
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `pdd-return-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('截图失败', error);
          alert('生成截图失败，请重试');
        } finally {
          this.isCapturing = false;
        }
      },
      async fillFromClipboard(target) {
        let text = '';
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            text = await navigator.clipboard.readText();
          } catch (err) {
            console.warn('读取剪贴板失败，使用手动输入', err);
          }
        }
        if (!text) {
          text = window.prompt('粘贴包含姓名、电话、地址的信息：');
        }
        if (!text) {
          return;
        }
        this.applyAddressText(text, target);
      },
      applyAddressText(text, target) {
        const parsed = parseAddressText(text);
        if (target === 'pickup') {
          const contact = [parsed.name, parsed.phone].filter(Boolean).join(' ').trim();
          if (contact) {
            this.data3 = contact;
          }
          if (parsed.address) {
            this.data4 = parsed.address;
          }
        } else if (target === 'receiver') {
          const receiver = [parsed.name, parsed.phone].filter(Boolean).join(' ').trim();
          if (receiver) {
            this.data5 = receiver;
          }
          if (parsed.address) {
            this.data6 = parsed.address;
          }
        }
      },
      updateTimeToNow() {
        this.data10 = getCurrentTime();
      },
    },
    mounted() {
      // Keep displayed time fresh on load
      this.updateTimeToNow();
    },
  }).mount('#app');
})();
