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
  const LOOSE_PHONE = /(1\d{10})/;

  function stripKeywordPrefix(text, regex) {
    if (!text) {
      return '';
    }
    const pattern = new RegExp(`^(?:${regex.source})[:：\\s]*`, 'i');
    return text.replace(pattern, '').trim();
  }

  function parseCombinedLine(line) {
    if (!line) {
      return null;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      return null;
    }
    const phoneMatch = trimmed.match(LOOSE_PHONE);
    if (!phoneMatch) {
      return null;
    }
    const phone = phoneMatch[1];
    const beforeRaw = trimmed.slice(0, phoneMatch.index).replace(/[,，]/g, ' ').trim();
    const afterRaw = trimmed.slice(phoneMatch.index + phone.length).replace(/^[,，]/, '').trim();
    let name = stripKeywordPrefix(beforeRaw, NAME_KEYWORDS);
    if (!name) {
      const nameTokens = beforeRaw.split(/[\s]+/).filter(Boolean);
      name = nameTokens.length ? nameTokens[nameTokens.length - 1] : '';
    }
    let address = stripKeywordPrefix(afterRaw, ADDRESS_KEYWORDS);
    if (!address) {
      address = afterRaw;
    }
    return { name, phone, address };
  }

  function extractCombinedContact(lines) {
    for (const line of lines) {
      const parsed = parseCombinedLine(line);
      if (parsed) {
        return parsed;
      }
    }
    return null;
  }

  function normalizeLines(text) {
    return text
      .replace(/\r/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  function parseAddressText(raw) {
      console.log('Parsing address text:', raw)
    if (!raw) {
      return { name: '', phone: '', address: '' };
    }
    const lines = normalizeLines(raw);
    if (!lines.length) {
      return { name: '', phone: '', address: '' };
    }

    const combined = extractCombinedContact(lines) || {};
    let phone = combined.phone || '';
    let name = combined.name || '';
    let address = combined.address || '';

    lines.forEach(line => {
      if (!phone) {
        const labelled = line.match(new RegExp(`${PHONE_KEYWORDS.source}[:：]*\\s*(1\\d{10})`, 'i'));
        phone = labelled && labelled[1] ? labelled[1] : '';
      }
      if (!phone) {
        const loose = line.match(LOOSE_PHONE);
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

    const containsPhone = line => {
      if (!line) {
        return false;
      }
      if (phone && line.includes(phone)) {
        return true;
      }
      return LOOSE_PHONE.test(line);
    };

    if (!address) {
      const reversed = [...lines].reverse();
      const candidate = reversed.find(line =>
        line.length > 8 &&
        !NAME_KEYWORDS.test(line) &&
        !PHONE_KEYWORDS.test(line) &&
        !containsPhone(line)
      );
      if (candidate) {
        address = candidate;
      } else {
        const fallback = reversed.find(line => !containsPhone(line));
        address = fallback || lines[lines.length - 1];
      }
    }

    return { name, phone, address };
  }

  createApp({
    data() {
      return {
        isCapturing: false,
        fields: [],
        layers: [],
        values: {},
        configError: '',
        isLoadingConfig: true,
      };
    },
    methods: {
      async loadConfig() {
        try {
          const response = await fetch('./config.json', { cache: 'no-cache' });
          if (!response.ok) {
            throw new Error(`配置请求失败：${response.status}`);
          }
          const config = await response.json();
          this.applyConfig(config);
          this.configError = '';
        } catch (error) {
          console.error('配置加载失败', error);
          this.configError = '配置加载失败，请刷新后重试';
        } finally {
          this.isLoadingConfig = false;
        }
      },
      applyConfig(config) {
        const fields = Array.isArray(config?.fields) ? config.fields : [];
        const layers = Array.isArray(config?.layers) ? config.layers : [];
        const nextValues = {};
        fields.forEach(field => {
          if (!field || !field.id) {
            return;
          }
          let value = field.defaultValue ?? '';
          if (field.useCurrentTime) {
            value = getCurrentTime();
          }
          nextValues[field.id] = value;
        });
        this.fields = fields;
        this.layers = layers;
        this.values = nextValues;
      },
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
      formatLayerValue(layer) {
        if (!layer || !layer.fieldId) {
          return '';
        }
        const raw = this.values[layer.fieldId] ?? '';
        return `${layer.prefix || ''}${raw}${layer.suffix || ''}`;
      },
      layerKey(layer, index) {
        return layer?.id || layer?.fieldId || `layer-${index}`;
      },
      isTextarea(field) {
        return this.inputTag(field) === 'textarea';
      },
      inputTag(field) {
        if (field?.inputTag) {
          return field.inputTag;
        }
        return field?.inputType === 'textarea' ? 'textarea' : 'input';
      },
      inputAttrs(field) {
        const attrs = {};
        if (!field) {
          return attrs;
        }
        const tag = this.inputTag(field);
        if (field.placeholder) {
          attrs.placeholder = field.placeholder;
        }
        if (field.rows && tag === 'textarea') {
          attrs.rows = field.rows;
        }
        if (field.maxLength) {
          attrs.maxlength = field.maxLength;
        }
        if (field.inputAttrs && typeof field.inputAttrs === 'object') {
          Object.assign(attrs, field.inputAttrs);
        }
        if (tag !== 'textarea') {
          attrs.type = field.inputType || 'text';
        }
        return attrs;
      },
      async fillFromClipboard(field) {
        if (!field) {
          return;
        }
        let text = '';
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            text = await navigator.clipboard.readText();
            console.log('剪贴板内容：', text)
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
        this.applyAddressText(text, field, field.clipboardHelper || {});
      },
      applyAddressText(text, field, helper) {
        const parsed = parseAddressText(text);
        const contactFieldId = helper.contactFieldId || field.id;
        if (contactFieldId) {
          const contact = [parsed.name, parsed.phone].filter(Boolean).join(' ').trim();
          if (contact) {
            this.values[contactFieldId] = contact;
          }
        }
        if (helper.addressFieldId && parsed.address) {
          this.values[helper.addressFieldId] = parsed.address;
        }
      },
      updateTimeToNow() {
        const now = getCurrentTime();
        this.fields.forEach(field => {
          if (field.useCurrentTime && field.id in this.values) {
            this.values[field.id] = now;
          }
        });
      },
    },
    mounted() {
      this.loadConfig();
    },
  }).mount('#app');
})();
