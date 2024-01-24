class Util {
  /**
   * 디바이스 체크
   * @returns "isMobile" or "isPC"
   */
  static deviceChk() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return 'isMobile'
    } else {
      return 'isPC'
    }
  }
  /**
   * @param {String} str 
   * @returns [data-ref="str"]
   */
  static returnRef(str) {
    return `[data-ref="${str}"]`;
  }
  /** 숫자 증감
   * @param {Object} param { start: 초기 값, total: 목표 값, time: sec, onEnd }
   */
  static numFunc(param) {
    let num = param.start;
    let timeCount = 0;
    const calcNum = (val, time) => {
      const result = val / (time * 60);
      return result;
    }
    let unit = (param.total > param.start && num < param.total) ? calcNum(param.total, param.time) : calcNum(param.start - param.total, param.time);
    let reqFunc;
    (reqFunc = ()=>{
      if(timeCount < param.time * 60) {
        if(param.total > param.start && num < param.total - unit) {
          num = num + unit;
        } else if(param.total < param.start && num > param.total + unit) {
          num = num - unit;
        }
        if(typeof param.callBack === 'function') param.callBack(num);
        window.requestAnimationFrame(reqFunc);
        timeCount++;
      } else {
        window.cancelAnimationFrame(reqFunc);
        if(typeof param.endCallBack === 'function') param.endCallBack(param.total);
      }
    })();
  }
  /**
   * 엘리먼트가 화면에 노출 될 때
   * @param {Element} el 
   * @param {Function} callback 
   * @param {Object} option ex: {rootMargin: '0px 0px -50px', threshold: 1.0}
   */
  static createObserver(el, callback, option) {
    const target = el;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if(typeof callback == 'function') callback(entry)
        }
      });
    }, option);
    target.forEach( _this => {
      observer.observe(_this);
    })
  }

  /**
   * @returns {key: val}
   */
  static getUrlParams() {
    let params = {}
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => { params[key] = value });
    return params;
  }

}

/** 
 * 슬라이드 open close toggle 기능
 */
const slide = {
  /** 
   * 슬라이드 open
   * @param {Element} el 엘리먼트
   * @param {Number} time 시간
   * @param {String} cls 슬라이드 후 적용 클래스
   * @param {Function} callBack 슬라이드 후 콜백 설정
   */
  open : (el, time, cls, callBack) => {
    let target = el;
    let targetHeight = 0;
    let style = target.style;
    style.position = 'absolute';
    style.display = 'block';
    style.opacity = '0';
    targetHeight = target.clientHeight;
    style.opacity = null;
    style.position = null;
    style.overflow = 'hidden';
    style.height = '0';
    style.transition = `height ${time * 0.001}s`;
    setTimeout(()=>{
      style.height = targetHeight + 'px';
    },1);
    setTimeout(()=>{
      style.display = null;
      style.overflow = null;
      style.height = null;
      style.transition = null;
      if(cls) target.classList.add(cls);
      if(typeof callBack === 'function') callBack();
    },time);
  },
  /** 
   * 슬라이드 close
   * @param {Element} el 엘리먼트
   * @param {Number} time 시간
   * @param {String} cls 슬라이드 후 적용 클래스
   * @param {Function} callBack 슬라이드 후 콜백 설정
   */
  close : (el, time, cls, callBack) => {
    let target = el;
    let targetHeight = el.clientHeight;
    let style = target.style;
    style.overflow = 'hidden';
    style.height = `${targetHeight}px`;
    style.transition = `height ${time * 0.001}s`;
    setTimeout(()=>{
      style.height = '0';
    },1);
    setTimeout(()=>{
      style.overflow = null;
      style.height = null;
      style.transition = null;
      if(cls) target.classList.remove(cls);
      if(typeof callBack === 'function') callBack();
    },time);
  },
  /** 
   * 슬라이드 toggle
   * @param {Element} el 엘리먼트
   * @param {Number} time 시간
   * @param {String} cls 슬라이드 후 적용 클래스
   * @param {Function} callBack 슬라이드 후 콜백 설정
   */
  toggle : (el, time, cls, callBack) => {
    (el.classList.contains(cls)) ? slide.close(el, time, cls, callBack) : slide.open(el, time, cls, callBack);
  }
}

class SideNav {
  /**
   * 
   * @param {Object} params {target: String or Element}
   */
  constructor(params) {
    this.wrap = (typeof params.target !== 'string') ? params.target : document.querySelector(Util.returnRef(params.target));
    this.btnToggle = this.wrap.querySelector(Util.returnRef('btn-toggle'))
    this.btnDepth1 = this.wrap.querySelectorAll('button[aria-expanded]');
    this.openBtn = null;
    this.openEl = null;
    this.addEvent();
  }
  addEvent() {
    this.btnToggle.addEventListener('click',()=>{
      document.body.classList.toggle('isSnbClose');
    });
    this.btnDepth1.forEach(_this=>{
      _this.addEventListener('click', this.depthToggle.bind(this, _this));
      if(_this.ariaExpanded == 'true') {
        this.openBtn = _this;
        this.openEl = this.wrap.querySelector(`#${_this.getAttribute('aria-controls')}`);
      }
    })
  }
  depthToggle(btnEl) {
    let target = this.wrap.querySelector(`#${btnEl.getAttribute('aria-controls')}`);
    if(btnEl.ariaExpanded == 'true') {
      btnEl.ariaExpanded = false;
      slide.close(target, 300, 'isOpen');
    } else {
      if(this.openEl !== null && this.openEl !== target) {
        this.openBtn.ariaExpanded = false;
        slide.close(this.openEl, 300, 'isOpen');
      }
      slide.open(target, 300, 'isOpen');
      this.openBtn = btnEl;
      this.openEl = target;
      btnEl.ariaExpanded = true;
    }
  }
}

class DropDown {
  /**
   * 
   * @param {Object} params {target: String or Element, data: Object}
   */
  constructor(params) {
    this.target = params.target;
    this.data = params.data;
    this.checkedStr = 'isChecked';
    this.defaultStr = (this.data.type === "multi") ? this.target.querySelector('.dropdown-btn__checked').innerText : params.target.innerText;
    this.defaulOption = this.data.option;
    this.multiEl = (this.data.type === "multi") ? this.target.querySelector('.dropdown-btn__checked') : null;
    this.selected = null;
    this.value = null;
    this.option = null;
    this.optionInner = null;
    this.state = false;
    this.keyboardState = 0;
    this.callBack = {
      change: null,
      open: null,
      close: null
    }
    this.globalSet = {
      open: null,
      close: null
    }
    this.init();
  }
  init() {
    (this.data.type !== 'input') ? this.btnInit() : this.inputInit();
  }
  btnInit() {
    this.target.addEventListener('click', e=>{
      e.stopPropagation();
      if(this.state === false) this.createOption();
      this.toggle();
    });
    this.target.addEventListener('keydown', e=>{
      switch(e.keyCode) {
        case 38 : { //up
          if(this.state !== false) {
            e.preventDefault();
            this.keyboardState = this.data.option.length - 1;
            this.data.option[this.keyboardState].btn.focus();
          }
          break;
        }
        case 40 : { //down
          if(this.state !== false) {
            e.preventDefault();
            this.data.option[this.keyboardState].btn.focus();
          }
          break;
        }
        case 13 : { //enter
          e.preventDefault();
          if(this.state === false) this.createOption();
          this.toggle();
          break;
        }
        default: break;
      }
    });
    this.data.option.forEach(_this=>{
      if(_this.checked === true) this.checkItem(_this.value);
    });
  }
  inputInit() {
    this.target.addEventListener('keyup', e=>{
      this.data.option = this.defaulOption.filter(item=>{
        if(item.name.indexOf(this.target.value) === 0) {
          return item;
        } else {
          return null;
        }
      });
      if(this.target.value.length > 0) {
        switch(e.keyCode) {
          case 40 : { //down
            e.preventDefault();
            this.data.option[0].btn.focus();
            break;
          }
          case 13 : { //enter
            e.preventDefault();
            break;
          }
          default: {
            if(this.data.option.length > 0) {
              this.createOption(this.data.option);
              if(this.state === false) this.open();
            } else if(this.state === 'open') {
              this.close();
            }
            break;
          }
        }
      } else {
        if(this.state === 'open') this.close();
      }
    });
  }
  close() {
    if(typeof this.globalSet.close === 'function') this.globalSet.close(this);
    this.state = false;
    this.option.remove();
    this.target.classList.remove('isOpen');
  }
  animateClose = ()=>{
    slide.close(this.option, 300, 'isOpen', ()=>{
      this.close();
    });
  }
  open() {
    this.state = true;
    const rect = this.target.getBoundingClientRect();
    let optionMargin = 8;
    this.option.style.left = (this.data.type !== 'input') ? rect.left + 'px' : rect.left + 44 + 'px';
    this.option.style.width = (this.data.type !== 'input') ? rect.width + 'px' : '180px';
    this.option.style.display = 'block';
    if(rect.top + rect.height + this.option.clientHeight < document.documentElement.clientHeight) {
      this.option.style.top = rect.top + rect.height + optionMargin + 'px';
    } else {
      this.option.style.bottom = document.documentElement.clientHeight - rect.bottom + rect.height + optionMargin + 'px';
    }
    this.target.classList.add('isOpen');
    if(this.data.type === 'input') {
      this.option.classList.add('isOpen');
      this.state = 'open';
    } else {
      slide.open(this.option, 300, 'isOpen', ()=>{this.state = 'open'});
    }
    if(typeof this.globalSet.open === 'function') this.globalSet.open(this);
    window.addEventListener('click', ()=>{this.animateClose()}, {once: true});
    window.addEventListener('scroll', ()=>{this.close()}, {once: true});
    window.addEventListener('resize', ()=>{this.close()}, {once: true});
    if(this.target.closest('.popup__scroll-view')) this.target.closest('.popup__scroll-view').addEventListener('scroll', ()=>{this.close()}, {once: true});
  }
  toggle() {
    if(this.state === 'open') {
      (this.type === 'input') ? this.close() : this.animateClose();
    } else if(this.state === false) {
      this.open();
    }
  }
  checkSingleItem(value) {
    if(this.data.type !== 'input') {
      let target;
      this.data.option.forEach((_this)=>{
        if(_this.checked === true) _this.checked = false;
        if(_this.value === value) target = _this;
      })
      this.value = target.value;
      if(this.selected !== null) {
        this.selected.classList.remove(this.checkedStr);
      }
      target.btn?.classList.add(this.checkedStr);
      this.target.innerText = target.name;
      target.checked = true;
    } else {
      this.target.value = value;
      this.value = value;
    }
  }
  checkMuitlItem(value) {
    let target;
    let chkState = false;
    let valueArry = [];
    const funcUnChecked = (item) => {
      item.checked = false;
      item.btn?.classList.remove(this.checkedStr);
    }
    this.data.option.forEach((_this)=>{
      if(_this.value === value) {
        target = _this;
        (_this.all) ? chkState = true : chkState = false;
      }
    });
    if(chkState === true) {
      this.data.option.forEach((_this)=>{
        if(!_this.all) funcUnChecked(_this);
      });
    } else {
      this.data.option.forEach((_this)=>{
        if(_this.all === true) funcUnChecked(_this);
      });
    }
    if(target.checked === true && !target.all) {
      funcUnChecked(target);
    } else {
      target.btn?.classList.add(this.checkedStr);
      target.checked = true;
    }
    this.data.option.forEach((_this)=>{
      if(_this.checked) valueArry.push(_this.value);
    });
    this.value = valueArry;
    if(this.value.length == 0 || (chkState !== false && this.data.option.length - this.value.length === 1)) {
      this.checkItem('all');
      chkState = true;
    }
    (chkState === true) ? this.multiEl.innerText = this.defaultStr : this.multiEl.innerText = this.value.length + '개';
  }
  checkItem(value) {
    (this.data.type !== 'multi') ? this.checkSingleItem(value) : this.checkMuitlItem(value);
    if(typeof this.callBack.change === 'function') this.callBack.change(this);
    return this;
  }
  returnMark(str) {
    let splitText = str.split("");
    let taggedText = splitText.map((txt, idx)=>{
      let returnStr = (this.target.value.indexOf(txt) > -1 && this.target.value.length > idx) ? `<span class="point-color">${txt}</span>` : txt;
      return returnStr;
    })
    let result = taggedText.join("");
    return result;
  }
  createOptionBtn(item) {
    const btn = document.createElement('button');
    btn.setAttribute('type','button');
    if(this.data.type === 'input') {
      btn.innerHTML = this.returnMark(item.name);
    } else {
      btn.innerText = item.name;
    }
    if(item.checked === true) {
      btn.classList.add(this.checkedStr);
      if(this.data.type !== 'multi') this.selected = btn;
    }
    if(item.disabled === true) btn.disabled = true;
    btn.addEventListener('click', ()=>{
      this.checkItem(item.value);
      if(this.data.type !== 'multi') this.toggle();
    });
    btn.addEventListener('keydown', e => {
      e.preventDefault();
      switch(e.keyCode) {
        case 38 : { //up
          if(0 < this.keyboardState) {
            this.keyboardState--;
          } else {
            this.keyboardState = this.data.option.length - 1;
          }
          this.data.option[this.keyboardState].btn.focus();
          break;
        }
        case 40 : { //down
          if(this.data.option.length - 1 > this.keyboardState) {
            this.keyboardState++;
          } else {
            this.keyboardState = 0;
          }
          this.data.option[this.keyboardState].btn.focus();
          break;
        }
        case 13 : { //enter
          this.checkItem(item.value);
          if(this.data.type !== 'multi') {
            this.toggle();
            this.target.focus();
          }
          break;
        }
        case 9 : { //tab
          this.toggle();
          break;
        }
        case 27 : { //esc
          this.toggle();
          this.target.focus();
          break;
        }
        default: break;
      }
    });
    return btn;
  }
  createOption(arry) {
    if(this.state == false) {
      this.option = document.createElement('div');
      this.optionInner = document.createElement('div');
      this.option.classList.add('dropdown-option');
      if(this.data.type === 'multi') this.option.classList.add('type-multi');
      this.optionInner.classList.add('inner');
      this.option.insertAdjacentElement('beforeend', this.optionInner);
      this.option.addEventListener('click', e => e.stopPropagation());
      document.body.insertAdjacentElement('beforeend', this.option);
    }
    if(this.data.type !== 'input') {
      this.data.option.forEach(item => {
        const btn = this.createOptionBtn(item);
        this.optionInner.insertAdjacentElement('beforeend', btn);
        item['btn'] = btn;
      });
    } else {
      this.optionInner.innerHTML = '';
      arry.forEach(item => {
        const btn = this.createOptionBtn(item);
        this.optionInner.insertAdjacentElement('beforeend', btn);
        item['btn'] = btn;
        item['value'] = item.name;
      });
    }
  }
  reset() {
    (this.data.type !== "multi") ? this.target.innerText = this.defaultStr : this.multiEl.innerText = this.defaultStr;
    this.data.option.forEach((_this)=>{
      if(_this.checked === true) _this.checked = false;
    });
    this.value = null;
    return this;
  }
  update(arry) {
    this.reset();
    if(this.data.type !== "multi" && Array.isArray(arry)) this.data.option = arry;
    return this.data.option;
  }
  onChange(func) { if(typeof func === 'function') this.callBack.change = func }
}

class GlobalSetObj {
  /**
   * 
   * @param {String} componentName 컴포넌트 명
   */
  constructor(componentName) {
    this.componentName = componentName;
    this.items = {};
    this.ready = {};
    this.openItem = {
      name: null,
      obj: null
    };
    this.init(this.componentName);
  }
  init(componentName, params) {
    const item = document.querySelectorAll(`[data-${componentName}]`);
    item.forEach(btnEl=>{
      const data = JSON.parse(btnEl.dataset[componentName]);
      if(componentName === 'dropdown' && !this.items.hasOwnProperty(data.name)) {
        this.addDropdown(btnEl, data);
      }
    });
    if(params && this.items[params.name] && typeof params.onChange === 'function') {
      this.items[params.name].onChange(params.onChange);
    }
    return this.items;
  }
  addDropdown(el, data) {
    this.items[data.name] = new DropDown({target: el, data: data});
    this.items[data.name].globalSet.open = item => {
      if(this.openItem.name !== null) {
        this.openItem.obj.toggle();
      }
      if(this.openItem.name !== data.name) {
        this.openItem.name = data.name;
        this.openItem.obj = item;
      }
    }
    this.items[data.name].globalSet.close = ()=>{
      if(this.openItem.name === data.name) {
        this.openItem = {
          name: null,
          obj: null
        };
      }
    }
  }
  /**
   * 콤퍼넌트 추가
   * @param {Object} params {target: Element, data: Object}
   */
  addItem(params) {
    if(this.componentName === 'dropdown' && !this.items.hasOwnProperty(params.data.name)) {
      this.addDropdown(params.target, params.data);
    }
  }
}

const dropdown = new GlobalSetObj('dropdown');
window.addEventListener('DOMContentLoaded',()=>{
  dropdown.init('dropdown');
});

class TabContents {
  /**
   * @param {Object} params {target: String or Element}
   */
  constructor(params) {
    this.wrap = (typeof params.target !== 'string') ? params.target : document.querySelector(Util.returnRef(params.target));
    this.menu = this.wrap.querySelector('[role="tablist"]');
    this.btn = this.menu.querySelectorAll('[role="tab"]');
    this.current = null;
    this.currentBtn = null;
    this.currentCont = null;
    this.currentStr = 'isActive';
    this.callBack = {
      change: null
    }
    this.init();
  }
  init() {
    for(let idx = 0; idx < this.btn.length ; idx++) {
      if(this.btn[idx].ariaSelected == 'true') {
        this.current = (this.btn[idx].getAttribute('aria-controls')) ? this.btn[idx].getAttribute('aria-controls') : this.btn[idx].innerText;
        this.currentBtn = this.btn[idx];
        this.currentBtn.parentNode.classList.add(this.currentStr)
        if(this.btn[idx].getAttribute('aria-controls')) {
          this.currentCont = document.querySelector(`#${this.current}`);
          this.currentCont.classList.add(this.currentStr);
        }
        break;
      }
    }
    this.addEvent();
  }
  addEvent() {
    for(let idx = 0; idx < this.btn.length ; idx++) {
      this.btn[idx].addEventListener('click', ()=>{
        this.active(idx);
      });
    }
  }
  active(target) {
    this.currentBtn.ariaSelected = false;
    this.currentBtn.parentNode.classList.remove(this.currentStr);
    if(typeof target === 'number') {
      this.currentBtn = this.btn[target];
    } else if(typeof target === 'string') {
      for(let idx = 0; idx < this.btn.length; idx++) {
        if(this.btn[idx].getAttribute('aria-controls') === target) this.currentBtn = this.btn[idx];
      }
    }
    this.currentBtn.ariaSelected = true;
    this.currentBtn.parentNode.classList.add(this.currentStr);
    if(this.currentBtn.getAttribute('aria-controls')) {
      this.current = this.currentBtn.getAttribute('aria-controls');
      this.currentCont.classList.remove(this.currentStr);
      if(document.querySelector(`#${this.current}`)) {
        this.currentCont = document.querySelector(`#${this.current}`);
        this.currentCont.classList.add(this.currentStr);
      }
    } else {
      this.current = this.currentBtn.innerText;
    }
    if(typeof this.callBack.change === 'function') this.callBack.change(this);
    return this;
  }
  onChange(func) {
    if(typeof func === 'function') this.callBack.change = func;
  }
}

/**
 * input class="isValue" toggle
 */
const inputValueChk = ()=>{
  const target = event.target;
  if(target.value.length > 0) {
    target.parentNode.classList.add('isValue');
  } else {
    target.parentNode.classList.remove('isValue');
  }
}

/**
 * input value delete
 */
const inputValueDel = ()=>{
  const box = event.target.closest('.input-box');
  const target = box.querySelector('.input-txt');
  box.classList.remove('isValue');
  target.value = '';
}

/**
 * input search toggle
 */
const inputSearchToggle = ()=>{
  const wrap = event.target.closest('.input-search-toggle');
  const target = wrap.querySelector('.toggle-target');
  const input = target.querySelector('.input-txt');
  if(!wrap.classList.contains('.isShow')) {
    target.style.width = input.clientWidth + 'px';
    wrap.classList.add('.isShow');
    input.focus();
  } else {
    target.style.width = 0;
    wrap.classList.remove('.isShow');
  }
}

/**
 * 
 * @param {String} target 컨트롤 할 체크박스 태그에 data-ref="target" 속성 값
 */
const inputCheckAll = target=>{
  const checkbox = document.querySelectorAll(Util.returnRef(target));
  const _this = event.target;
  let allCheckbox;
  checkbox.forEach(el=>{
    if(el.value === 'chkAll') allCheckbox = el;
  })
  if(_this.checked === true) {
    if(allCheckbox === _this) {
      checkbox.forEach(_this=>{
        _this.checked = true;
        if(_this.closest('tr')) _this.closest('tr').classList.add('isChecked');
      });
    } else {
      let chk = false;
      for(let idx = 0; idx < checkbox.length; idx++) {
        if(allCheckbox !== checkbox[idx]) {
          if(checkbox[idx].checked === false) {
            chk = false;
            break;
          } else {
            chk = true;
          }
        }
      }
      if(chk === true) allCheckbox.checked = true;
      if(_this.closest('tr')) _this.closest('tr').classList.add('isChecked');
    }
    if(document.querySelector(Util.returnRef('rowCheck'))) document.querySelector(Util.returnRef('rowCheck')).style.display = 'flex';
    if(document.querySelector(Util.returnRef('rowNoneCheck'))) document.querySelector(Util.returnRef('rowNoneCheck')).style.display = 'none';
  } else {
    if(allCheckbox === _this) {
      checkbox.forEach(_this=>{
        _this.checked = false;
        if(_this.closest('tr')) _this.closest('tr').classList.remove('isChecked');
      });
    } else {
      for(let idx = 0; idx < checkbox.length; idx++) {
        if(allCheckbox !== checkbox[idx] && checkbox[idx].checked === false) {
          allCheckbox.checked = false;
          break;
        }
      }
      if(_this.closest('tr')) _this.closest('tr').classList.remove('isChecked');
    }
    let chk = false;
    for(let idx = 0; idx < checkbox.length; idx++) {
      if(checkbox[idx].checked === true) {
        chk = true;
        break;
      } else {
        chk = false;
      }
    }

    if(chk === false) {
      if(document.querySelector(Util.returnRef('rowCheck'))) document.querySelector(Util.returnRef('rowCheck')).style.display = 'none';
      if(document.querySelector(Util.returnRef('rowNoneCheck'))) document.querySelector(Util.returnRef('rowNoneCheck')).style.display = 'flex';
    }
  }
}

class LayerPopup {
  /**
   * 레이어팝업
   * @param {Object} params {target: data-ref 네임, dimClose: 딤 클릭 시 숨김 처리 유무}
   */
  constructor(params) {
    this.params = params;
    this.wrap = document.querySelector(Util.returnRef(this.params.target));
    this.container = this.wrap.querySelector('.popup__container');
    this.timer = 250;
    this.state = 'hide';
    this.dimClose = (params.hasOwnProperty('dimClose') && typeof params.dimClose === 'boolean') ? false : true;
    this.callBack = {
      show: null,
      hide: null,
      remove: null
    }
    this.prevLayer = false;
    this.init(params);
  }
  init() {
    if(this.dimClose === true) {
      this.wrap.addEventListener('click',e=>{
        if(e.target == this.wrap) this.hide();
      });
    }
  }
  show(callBack) {
    if(document.body.classList.contains('isLayerShow')) this.prevLayer = true;
    document.body.classList.add('isLayerShow');
    this.state = 'show';
    this.wrap.classList.add('isShow');
    setTimeout(()=>{
      this.container.classList.add('isShow');
    }, 1);
    if(typeof callBack === 'function') callBack(this);
    if(this.callBack.show) this.callBack.show(this);
  }
  hide(callBack) {
    this.state = 'hide';
    this.container.classList.remove('isShow');
    setTimeout(()=>{
      this.wrap.classList.remove('isShow');
      if(this.prevLayer === false) document.body.classList.remove('isLayerShow');
      if(this.params.target === 'layerMsg' || this.params.target === 'layerDialog') this.wrap.remove();
      if(typeof callBack === 'function') callBack(this);
      if(this.callBack.hide) this.callBack.hide(this);
      if(this.callBack.remove) this.callBack.remove(this);
    }, this.timer);
  }
  onShow(callBack) {if(typeof callBack === 'function') this.callBack.show = callBack;}
  onHide(callBack) {if(typeof callBack === 'function') this.callBack.hide = callBack;}
  onRemove(callBack) {
    this.wrap.remove();
    if(typeof callBack === 'function') this.callBack.remove = callBack;
  }
}

/**
 * 메시지 팝업
 * @param {Object} params {
 *  msg: 줄바꿈 == <br>,
 *  type: 'confirm', //confirm 일 경우
 *  btn: {confirm: '선택', cancel: '삭제'}, // 기본 값은 확인, 취소
 *  onConfirm: 확인 버튼 누름
 *  onCancel: 취소 버튼 누름
 *  onShow: 메시지가 보여질 때
 *  onHide: 메시지가 사라질 때
 * }
 */
const layerMsg = (params) => {
  let btn = {
    confirm: "확인",
    cancel: "취소"
  }
  if(params.btn) btn = {...btn, ...params.btn};
  const createBtn = (obj) => {
    let btns = '';
    obj.forEach((_this, idx)=>{
      btns += `<button class="base-btn ${_this.type}" data-ref="btnFunc${idx}">${_this.name}</button>`;
    });
    return btns;
  }
  const funcHide = ()=>{
    layerMsg.hide();
    if(typeof params.onHide === 'function') params.onHide();
  }
  const returnMsg = ()=>{
    let value = '';
    for (const item in params) {
      if(params[item] !== 'alert') value += params[item];
    }
    return value;
  }
  const template = `
    <div class="layer-popup type-modal" data-ref="layerMsg">
      <section class="popup__container">
        <div class="popup__header">
          <h3 class="popup__title">안내</h3>
        </div>
        <div class="popup__contents">
          <p class="type-msg">${(params.type === 'alert' || params.type === 'confirm')? returnMsg() : params.msg}</p>
        </div>
        ${
          (params.customBtn) 
          ? `<div class="popup__btn-wrap type-column">
              ${createBtn(params.customBtn)}
            </div>`
          : `<div class="popup__btn-wrap">
              ${(params.type && params.type == 'confirm') ? `<button class="base-btn type2__size-m" data-ref="btnCancel">${btn.cancel}</button>` : ''}
              <button class="base-btn type1__size-m" data-ref="btnConfirm">${btn.confirm}</button>
            </div>`
        }
        <button class="btn-close" data-ref="btnClose">닫기</button>
      </section>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', template);
  let layerMsg = new LayerPopup({target: "layerMsg", dimClose: true});
  layerMsg.onShow(()=>{
    if(typeof params.onShow === 'function') params.onShow();
  });
  if(params.customBtn) {
    const btns = layerMsg.wrap.querySelectorAll('.base-btn');
    params.customBtn.forEach((obj, idx)=>{
      if(btns[idx].dataset.ref === `btnFunc${idx}`) {
        btns[idx].addEventListener('click',obj.func);
      }
    })
  } else {
    layerMsg.wrap.querySelector(Util.returnRef('btnConfirm')).addEventListener('click',()=>{
      layerMsg.onHide(()=>{if(typeof params.onConfirm === 'function') params.onConfirm()});
      funcHide();
    });
    if(params.type && params.type == 'confirm') {
      layerMsg.wrap.querySelector(Util.returnRef('btnCancel')).addEventListener('click',()=>{
        layerMsg.onHide(()=>{if(typeof params.onCancel === 'function') params.onCancel()});
        funcHide();
        return false;
      });
    }
  }
  layerMsg.wrap.querySelector(Util.returnRef('btnClose')).addEventListener('click',()=>funcHide());
  layerMsg.show();
}

window.alert = (params) => layerMsg({'type': 'alert', ...params});
window.confirm = (params) => layerMsg({'type': 'confirm', ...params});

class CreateTag {
  /**
   * 
   * @param {Object} params 태그 생성 영역 엘리먼트, 태그 형태 넘버
   */
  constructor(params) {
    this.wrap = params.target;
    this.tagType = params.tagType;
    this.tagBox = this.wrap.querySelector('.tag__box');
    this.tagItems = null;
  }
  tagTxt(val1, val2) {
    const tagItem = document.createElement('div');
    tagItem.classList.add('tag__item');
    let txt;
    switch(this.tagType) {
      case 1: {
        txt = `<span class="txt">${val1} > ${val2}</span>`;
        tagItem.classList.add('tag__item--type1');
        break;
      }
      case 2: {
        txt = `<span class="txt">${val1}</span>`;
        tagItem.classList.add('tag__item--type2');
        break;
      }
      default: break;
    }
    tagItem.insertAdjacentHTML('beforeend', txt);
    const btnDel = document.createElement('button');
    btnDel.setAttribute('type','button');
    btnDel.classList.add('del');
    btnDel.addEventListener('click',()=>{
      tagItem.remove();
      if(this.tagBox.querySelectorAll('.tag__item').length === 0) {
        this.wrap.style.display = 'none';
      }
    })
    tagItem.insertAdjacentElement('beforeend', btnDel);
    return tagItem;
  }
  showWrap(val1, val2) {
    const tagItem = this.tagTxt(val1, val2);
    this.wrap.style.display = 'block';
    this.tagItems = this.tagBox.querySelectorAll('.tag__item');
    let addState = true;
    if(this.tagItems.length > 0) {
      for(let idx = 0 ; idx < this.tagItems.length ; idx++) {
        if(this.tagItems[idx].innerText === tagItem.innerText) {
          addState = false;
          break;
        }
      }
    }
    if(addState === true) {
      this.tagBox.insertAdjacentElement('beforeend', tagItem);
      this.tagItems = this.tagBox.querySelectorAll('.tag__item');
    }
  }
  addTag(val1, val2) {
    switch(this.tagType) {
      case 1: {
        if(val1.length && val2.length) this.showWrap(val1, val2);
        break;
      }
      case 2: {
        if(val1.length) this.showWrap(val1);
        break;
      }
      default: break;
    }
  }
  reset() {
    this.wrap.style.display = 'none';
    this.tagBox.innerHTML = '';
    this.tagItems = null;
  }
}
/**
 * 인풋 엘리먼트 삭제
 * @param {Numer} num 삭제할 클래스명 숫자로 구분
 */
const rowItemDel = (num)=>{
  const _this = event.target;
  let target;
  switch(num) {
    case 1 : {
      target = _this.closest('.form-row__flex');
      break;
    }
    case 2 : {
      target = _this.closest('.form-cell');
      break;
    }
    default : {
      target = _this.closest('.form-inner');
    }
  }
  target.remove();
}
/**
 * 
 * @param {Number} num 추가할 엘리먼트 탬플릿 타입별 넘버
 * @param {Element} targetEl 특정 엘리먼트에 추가 할 경우만 작성하지 않는 경우에는 이벤트 타겟 바로 위에 생성
 */
const rowItemAdd = (num, targetEl)=>{
  const _this = event.currentTarget;
  let target = _this.closest('.form-inner');
  let template;
  switch(num) {
    case 1 : {
      template = `
        <div class="form-inner type-gap2">
          <button type="button" class="btn-item--del" onclick="rowItemDel();">
            <span>삭제</span>
          </button>
          <div class="input-box" style="flex:1;">
            <input type="text" class="input-txt" placeholder="입력하세요" oninput="inputValueChk()">
            <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
          </div>
        </div>
      `;
      break;
    }
    case 2 : {
      template = `
      <div class="form-inner">
        <button type="button" class="btn-item--del" onclick="rowItemDel();">
          <span>삭제</span>
        </button>
        <div class="input-box" style="width: 108px;">
          <input type="text" class="input-txt" placeholder="항목" oninput="inputValueChk()">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
        <div class="input-box" style="flex: 1;">
          <input type="text" class="input-txt" placeholder="입력하세요" oninput="inputValueChk()">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
        <div class="form-row__option">
          <label class="input-chk type2">
            <input type="checkbox">
            <span>필수</span>
          </label>
          <label class="toggle-show">
            <input type="checkbox" checked>
            <span>체크</span>
          </label>
        </div>
      </div>
      `;
      break;
    }
    case 3 : {
      template = `
      <div class="form-inner">
        <button type="button" class="btn-item--del" onclick="rowItemDel();">
          <span>삭제</span>
        </button>
        <div class="input-box" style="flex: 1;">
          <input type="text" class="input-txt" placeholder="입력하세요" oninput="inputValueChk()">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
        <div class="form-row__option">
          <label class="input-chk type2">
            <input type="checkbox">
            <span>필수</span>
          </label>
          <label class="toggle-show">
            <input type="checkbox" checked>
            <span>체크</span>
          </label>
        </div>
      </div>
      `;
      break;
    }
    case 4 : {
      template = `
      <div class="form-inner type-gap2">
        <button type="button" class="btn-item--del" onclick="rowItemDel();">
          <span>삭제</span>
        </button>
        <div class="input-box" style="width: 100%;">
          <input type="text" class="input-txt" oninput="inputValueChk()" placeholder="하위요소명 입력">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
        <div class="input-box" style="width: 100%;">
          <input type="text" class="input-txt" oninput="inputValueChk()" placeholder="하위요소명 입력">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
      </div>
      `;
      break;
    }
    case 5 : {
      template = `
      <div class="form-inner type-gap2">
        <button type="button" class="btn-item--del" onclick="rowItemDel(1);">
          <span>삭제</span>
        </button>
        <div class="input-box" style="flex: 1;">
          <input type="text" class="input-txt" placeholder="추가질문명" oninput="inputValueChk()">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
      </div>
      `;
      break;
    }
    case 6 : {
      template = `
      <div class="form-inner type-gap2">
        <button type="button" class="btn-item--del" onclick="rowItemDel(1);">
          <span>삭제</span>
        </button>
        <div class="input-box" style="width: 346px;">
          <input type="text" class="input-txt" placeholder="주질문명" oninput="inputValueChk()">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
        <div class="input-box" style="flex: 1;">
          <input type="text" class="input-txt" placeholder="설명" oninput="inputValueChk()">
          <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
        </div>
      </div>
      `;
      break;
    }
    case 7 : {
      template = `
        <div class="form-inner type-mt2 type-gap2">
          <button type="button" class="btn-item--del" onclick="rowItemDel();">
            <span>삭제</span>
          </button>
          <div class="with-txt">
            <input type="text" class="input-txt size-s center" placeholder="점수" style="width: 56px;"> 점
          </div>
          <div class="input-box" style="flex: 1;">
            <input type="text" class="input-txt size-s" placeholder="척도 설명" oninput="inputValueChk()">
            <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
          </div>
          <button type="button" onclick="rowItemUp('.form-inner')">
            <span class="base-icon icon-up__size-m__color3">
              <span class="isHidden">위로</span>
            </span>
          </button>
          <button type="button" onclick="rowItemDown('.form-inner')">
            <span class="base-icon icon-down2__size-m__color3">
              <span class="isHidden">아래로</span>
            </span>
          </button>
        </div>
      `
      break;
    }
    case 8 : {
      template = `
        <div class="form-inner type-mt2 type-gap2">
          <button type="button" class="btn-item--del" onclick="rowItemDel();">
            <span>삭제</span>
          </button>
          <div class="with-txt">
            <input type="text" class="input-txt size-s center" value="10" style="width: 56px;" disabled> 점
          </div>
          <div>
            <input type="text" class="input-txt size-s" placeholder="척도명" style="width: 58px;">
          </div>
          <div class="input-box" style="flex: 1;">
            <input type="text" class="input-txt size-s" placeholder="척도 설명" oninput="inputValueChk()">
            <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
          </div>
          <button type="button" onclick="rowItemUp('.form-inner')">
            <span class="base-icon icon-up__size-m__color3">
              <span class="isHidden">위로</span>
            </span>
          </button>
          <button type="button" onclick="rowItemDown('.form-inner')">
            <span class="base-icon icon-down2__size-m__color3">
              <span class="isHidden">아래로</span>
            </span>
          </button>
        </div>
      `
      break;
    }
    default : {
      template = `
        <div class="form-inner type-gap2">
          <button type="button" class="btn-item--del" onclick="rowItemDel();">
            <span>삭제</span>
          </button>
          <div class="input-box" style="width: 200px;">
            <input type="text" class="input-txt" placeholder="하위요소명" oninput="inputValueChk()">
            <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
          </div>
          <div class="input-box" style="flex: 1;">
            <input type="text" class="input-txt" placeholder="하위요소설명" oninput="inputValueChk()">
            <button type="button" class="btn-del" onclick="inputValueDel()">입력 삭제</button>
          </div>
        </div>
      `;
      break;
    }
  }
  (targetEl) ? targetEl.insertAdjacentHTML('beforeend', template) : target.insertAdjacentHTML('beforebegin', template);
}
/**
 * 아이템 순서를 대상 위로 옮길 경우에 사용
 * @param {String} target 대상 클래스명
 */
const rowItemUp = target=>{
  const item = event.target.closest(target);
  if(item.previousElementSibling) item.previousElementSibling.insertAdjacentElement('beforebegin', item);
}
/**
 * 아이템 순서를 대상 아래로 옮길 경우 사용
 * @param {String} target 대상 클래스명
 */
const rowItemDown = target=>{
  const item = event.target.closest(target);
  if(item.nextElementSibling) item.nextElementSibling.insertAdjacentElement('afterend', item);
}
/**
 * 컨텐츠 네비게이션
 */
class ContentsNav {
  constructor() {
    this.wrap = document.querySelector('.contents-nav');
    this.btns = document.querySelectorAll('[data-target-btn]');
    this.items = document.querySelectorAll('[data-target-cont]');
    this.margin = (this.wrap.classList.contains('type2')) ? 84 : 150;
    this.arry = [0];
    this.current = 0;
    this.state = true;
    this.init();
  }
  init() {
    this.set();
    this.addEvent();
  }
  addEvent() {
    window.addEventListener('resize', ()=>{
      this.set();
    });
    this.btns.forEach((btn, idx)=>{
      btn.addEventListener('click', ()=>{this.go(idx)});
    })
  }
  set() {
    this.arry = [0];
    for(let idx = 1 ; idx <= this.items.length; idx++) {
      if(idx === this.items.length) {
        this.arry.push(document.body.clientHeight);
      } else {
        this.arry.push(window.scrollY + this.items[idx].getBoundingClientRect().top - this.margin);
      }
    }
    window.addEventListener('scroll', ()=>{
      this.scrollChk();
    });
    if(window.scrollY === 0) this.btns[this.current].classList.add('isCurrent');
  }
  scrollChk() {
    if(this.state === true) {
      let currentNum = this.current;
      for(let idx = 0 ; idx < this.arry.length; idx++) {
        if(this.arry[idx] <= window.scrollY && window.scrollY < this.arry[idx + 1] - 50) {
          currentNum = idx;
          break;
        }
      }
      if(this.current !== currentNum) {
        this.btns[this.current].classList.remove('isCurrent');
        this.current = currentNum;
        this.btns[this.current].classList.add('isCurrent');
      }
    }
  }
  go(target) {
    this.btns[this.current].classList.remove('isCurrent');
    this.current = target;
    this.btns[this.current].classList.add('isCurrent');
    this.state = false;
    Util.numFunc({
      start: window.scrollY,
      total: this.arry[target],
      time: .2,
      callBack: val=>{
        window.scrollTo(0, val);
      },
      endCallBack: val=>{
        window.scrollTo(0, val);
        this.state = true;
        this.set();
      }
    })
  }
}

class ControlAddItem {
  /**
   * 
   * @param {Object} params 
   * target: data-ref 속성 or Element,
   * wrapTag: 생성할 태그 명,
   * wrapClassName: 생성 도니 태그에 클래스명,
   * stateNum: 1 태그 내에 순서대로 숫자가 들어가야 할 경우 상태 넘버
   * template: html 태그 문자열 
   */
  constructor(params) {
    this.target = (typeof params.target === 'string') ? document.querySelector(Util.returnRef(params.target)) : params.target;
    this.name = params.target
    this.template = params.template;
    this.wrapTag = params.wrapTag;
    this.wrapClassName = params.wrapClassName;
    this.stateNum = params.stateNum;
    this.innerControl = null;
    this.innerTemplate = params.innerTemplate;
    this.addCallBack = (typeof params.addCallBack === 'function') ? params.addCallBack : null;
    this.calendarInit(this.target);
    this.innerControlInit();
  }
  calendarInit(wrap) {
    const calendar = wrap.querySelectorAll('.type-calendar input');
    if(calendar) calendar.forEach(_this=> {
      new Datepicker(_this, CALENDAR_DEFAULT_OPTION)
    });
  }
  dropdownInit(wrap) {
    const items = wrap.querySelectorAll('[data-dropdown]');
    if(items) items.forEach((_this, idx)=>{
      let data = {name: `${this.name}_${this.stateNum}_${idx}`, ...JSON.parse(_this.dataset.dropdown)};
      dropdown.addItem({
        target: _this,
        data: data
      });
    })
  }
  add() {
    const wrap = document.createElement(this.wrapTag);
    wrap.innerHTML = this.template;
    if(this.wrapClassName) wrap.classList.add(this.wrapClassName);
    this.calendarInit(wrap);
    this.dropdownInit(wrap);
    this.target.insertAdjacentElement('beforeend', wrap);
    this.stateNum++;
    if(wrap.querySelectorAll(Util.returnRef('num'))) wrap.querySelectorAll(Util.returnRef('num'))[0].innerText = this.stateNum;
    if(this.innerTemplate) this.innerControlInit(wrap);
    if(this.addCallBack) this.addCallBack(wrap, this);
  }
  del(target) {
    event.target.closest(target).remove();
  }
  itemUp(target) {
    const item = event.target.closest(target);
    if(item.previousElementSibling) item.previousElementSibling.insertAdjacentElement('beforebegin', item);
  }
  itemDown(target) {
    const item = event.target.closest(target);
    if(item.nextElementSibling) item.nextElementSibling.insertAdjacentElement('afterend', item);
  }
  innerControlInit(wrap) {
    const targetWrap = (wrap) ? wrap : this.target;
    if(this.innerTemplate) {
      const target = targetWrap.querySelector(Util.returnRef('innerControl'));
      const firstEl = document.createElement('section');
      firstEl.classList.add('form-set__box');
      firstEl.innerHTML = this.innerTemplate;
      target.insertAdjacentElement('beforeend', firstEl);
      const controlAdd = (targetEl, item)=>{
        targetEl.querySelector(Util.returnRef('btnItemUp')).addEventListener('click', ()=>{
          item.itemUp('.form-set__box');
        });
        targetEl.querySelector(Util.returnRef('btnItemDown')).addEventListener('click', ()=>{
          item.itemDown('.form-set__box');
        });
        targetEl.querySelector(Util.returnRef('btnItemDel')).addEventListener('click', ()=>{
          item.del('.form-set__box');
        });
      }
      const innerControl = new ControlAddItem({
        target: target,
        wrapTag: 'section',
        wrapClassName: ["form-set__box"],
        stateNum: 1,
        template: this.innerTemplate,
        addCallBack: (targetEl, item)=>{
          controlAdd(targetEl, item);
        }
      });
      controlAdd(firstEl, innerControl);
      targetWrap.querySelector(Util.returnRef('btnInnerControlAdd')).addEventListener('click', ()=>{
        innerControl.add();
      });
    }
  }
}

/** 
 * 데이트 피커 옵션
 */
Datepicker.locales.ko = {
  days: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
  daysShort: ["일", "월", "화", "수", "목", "금", "토"],
  daysMin:  ["일", "월", "화", "수", "목", "금", "토"],
  months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  today: "오늘",
  clear: "삭제",
  format: "yyyy.mm.dd",
  titleFormat: "y년 mm월",
  weekStart: 0,
};
const CALENDAR_DEFAULT_OPTION = {
  language: 'ko',
  todayHighlight: true,
  beforeShowDay: (date)=>{
    return {
      content: `<span class="inner">${date.getDate()}</span>`,
    };
  }
}

// 토글 버튼으로 라디오 제어
function changeRadio (el) {
  const target = document.querySelectorAll(el);
  target.forEach(item=>{
    item.disabled = !item.disabled
    item.checked = false;
  });
}

// 입사지원 약관과 비슷한 체크박스와 라디오 공통제어 클래스
class CheckboxManager {
  constructor(masterSelector, childSelector, initialCheckedState = false) {
    this.masterCheckbox = document.querySelector(masterSelector);
    this.childCheckboxes = document.querySelectorAll(childSelector);
    this.initialCheckedState = initialCheckedState;

    this.init();
  }

  init() {
    this.masterCheckbox.checked = this.initialCheckedState; // 초기 체크 상태 설정
    this.toggleChildCheckboxes(); // 초기 상태에 따라 자식 체크박스들을 설정

    this.masterCheckbox.addEventListener('change', () => {
      this.toggleChildCheckboxes();
    });

    this.childCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        this.updateMasterCheckbox();
        this.toggleRadioButtons(checkbox);
      });
    });
  }

  toggleChildCheckboxes() {
    const masterChecked = this.masterCheckbox.checked;
    this.childCheckboxes.forEach((checkbox) => {
      checkbox.checked = masterChecked;
      this.toggleRadioButtons(checkbox);
    });

    return masterChecked; // masterChecked 값 반환
  }

  updateMasterCheckbox() {
    let allChecked = Array.from(this.childCheckboxes).every(checkbox => checkbox.checked);
    this.masterCheckbox.checked = allChecked;
  }

  toggleRadioButtons(checkbox) {
    const radioButtons = checkbox.closest('.agree-toggle-row').querySelector('.col-right').querySelectorAll('input[type="radio"]');
    Array.from(radioButtons).forEach(radio => {
      radio.disabled = !checkbox.checked;
    });
  }

  // master체크 박스 초기 설정
  static initializeCheckboxManagers(configs) {
    configs.forEach(config => {
      new CheckboxManager(config.master, config.children, config.initialState);
    });
  }
}

// 입사지원 약관과 비슷한 체크박스와 라디오 공통제어 여러개일 때
function initializeCheckboxManagers(checkboxGroups) {
    checkboxGroups.forEach(group => {
        new CheckboxManager(group.master, group.children);
    });
}   

// 리스트 검색 컴포넌트
$.fn.searchList = function (options) {
  return this.each(function () {
    // 필요한 경우에 옵션
    var settings = $.extend({}, options);

    const schComp = $(this);
    // 좌측 콤보박스
    const leftDropdown = $(this).find('.dropdown.first');
    const leftDropdownBtn = leftDropdown.find('.dropdown-btn');
    const leftDropdownOpt = leftDropdown.find('.dropdown-option');
    const leftDropdownOptBtn = leftDropdown.find('.dropdown-option button');
    // 검색몸통
    const schCompInp = $(this).find('.sch-comp__inp');
    // 추가 시 나오는 태그
    const searchTag = $(this).find('.search-tag');
    const tagBox = searchTag.find('.tag__box');

    const btnAdd = $(this).find('.btn-add'); // 추가 버튼

    const ssContainer = $(this).find('.sch-comp__inp[data-type="search-select"]');
    const ssBtn = $(this).find('.sch-comp__ss-btn');
    const ssInp = $(this).find('.sch-comp__ss .input-txt');
    const ssOpt = $(this).find('.sch-comp__ss');
    const ssResult = $(this).find('.sch-comp__ss-result');
    const ssResultItem = $(this).find('.sch-comp__ss-result li');
    const ssResultBtn = $(this).find('.sch-comp__btn-result');
    const dpInp1 = $(this).find('.datepicker-input1');
    const dpInp2 = $(this).find('.datepicker-input2');
    const onlySelect = $(this).find('.sch-comp__inp[data-type="select"]');
    const sBtn = onlySelect.find('.sch-comp__s-btn');
    const sDropOpt = onlySelect.find('.dropdown-option');
    const sDropOptBtn = onlySelect.find('.dropdown-option button');
    const reset = $(this).find('.js-reset');
    const go = $(this).find('.js-go');

    // 왼쪽 셀렉트
    leftDropdown.on('focusout', function() {
      setTimeout(()=>{
        $(this).removeClass('active')
        leftDropdownOpt.slideUp(200)
      }, 100)
    });
    leftDropdownBtn.on('click', function () {
      if(leftDropdown.hasClass('active')) {
        leftDropdown.removeClass('active')
        leftDropdownOpt.stop().slideUp(200)
      } else {
        leftDropdown.addClass('active')
        leftDropdownOpt.stop().slideDown(200)
      }
    });
    leftDropdownOptBtn.on('click', function () {
      const curText = $(this).text()
      var checkType = $(this).attr('data-type')
      leftDropdownOptBtn.removeClass('isChecked')
      $(this).addClass('isChecked')
      leftDropdownBtn.text(curText)
      leftDropdown.removeClass('active')
      leftDropdownOpt.stop().slideUp(200)
      schCompInp.removeClass('active')

      schComp.attr('data-type', checkType);

      // checkType 값이 일치하는 schCompInp 요소들을 찾아서 active 클래스 추가
      schCompInp.filter(`[data-type="${checkType}"]`).addClass('active');

      // 콤보박스 선택될 때 기간 날짜 초기화
      dpInp1.val('')
      dpInp2.val('')
    });

    //추가 버튼
    btnAdd.on('click', function () {
      const currentType = schComp.attr('data-type');
      const currentTypeKor = leftDropdownOptBtn.filter(`[data-type="${currentType}"]`).text();
      let tagTemp = ''
      let schData = ''
      // 기간 선택일 경우만
      if (currentType === 'date-picker') {
        const date1 = dpInp1.val();
        const date2 = dpInp2.val();
        tagTemp = `<div class="tag__item tag__item--type1"><span class="txt">기간 &gt; ${date1} ~ ${date1}</span><button type="button" class="del"></button></div>`
      // 그 외 나머지
      } else { 
        schData = schCompInp.filter(`[data-type="${currentType}"]`).find('.sch-data').val();
        tagTemp = `<div class="tag__item tag__item--type1"><span class="txt">${currentTypeKor} &gt; ${schData}</span><button type="button" class="del"></button></div>`
      }
      tagBox.append(tagTemp)
      tagBox.find('.del').on('click', function() {
        $(this).closest('.tag__item').remove();
        updateSearchTagActive(); // 태그 삭제 후 active 클래스 업데이트
      });
    
      updateSearchTagActive(); // 태그 추가 후 active 클래스 업데이트
    });

    $(document).on('click', function(event) {
      // 이벤트가 ssContainer 내부에서 발생했는지 확인
      if (!$(event.target).closest('.sch-comp__inp[data-type="search-select"]').length) {
        // ssContainer 외부에서 클릭 이벤트가 발생했을 때 수행할 동작
        ssOpt.stop().slideUp(200); // 예를 들어, 옵션을 닫습니다.
        ssBtn.removeClass('active');
      }
    });    

    // 기업명 선택
    ssBtn.on('click', function() {
      if($(this).hasClass('active')) {
        $(this).removeClass('active')
        ssOpt.stop().slideUp(200)
      } else {
        $(this).addClass('active')
        ssOpt.stop().slideDown(200)
      }
    })

    // 기업명 선택하기
    ssResultBtn.on('click', function (e) {
      e.preventDefault();
      const currentValue = $(this).text();
      const inp = ssOpt.find('.input-txt');
      const inpHidden = ssResult.find('.sch-data');
      inpHidden.val(currentValue)
      ssBtn.removeClass('active')
      ssOpt.stop().slideUp(200)
      btnAdd.click()
      inp.val('')
      ssResultItem.show();
    })

    // 기업명 검색
    ssInp.on('input', function() {
      var searchText = $(this).val().toLowerCase();
  
      ssResultItem.each(function() {
        var listItemText = $(this).find('.sch-comp__btn-result').text().toLowerCase();
        if (listItemText.includes(searchText)) {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    });   

    // 필기 전형
    sBtn.on('click', function () {
      console.log('sbtn', sDropOpt);
      if($(this).hasClass('active')) {
        $(this).removeClass('active')
        sDropOpt.stop().slideUp(200)
      } else {
        $(this).addClass('active')
        sDropOpt.stop().slideDown(200)
      }
    })
    
    // 필기전형 선택하기
    sDropOptBtn.on('click', function (e) {
      e.preventDefault();
      const currentValue = $(this).text();
      const inpHidden = onlySelect.find('.sch-data');
      inpHidden.val(currentValue)
      sBtn.removeClass('active')
      sDropOpt.removeClass('active')
      btnAdd.click()
    })

    // 필기전형 포커스 아웃
    sBtn.on('blur', function () {
      console.log('blur');
      setTimeout(()=>{
        $(this).removeClass('active')
        sDropOpt.removeClass('active').stop().slideUp(200)
      }, 100)
    })
    
    // 초기화
    reset.on('click', function(){
      tagBox.html('')
      updateSearchTagActive(); // 태그 초기화 후 active 클래스 업데이트
    });

    // 태그 추가 또는 삭제 후 searchTag의 active 클래스를 업데이트하는 함수
    function updateSearchTagActive() {
      if (tagBox.find('.tag__item').length > 0) {
        searchTag.addClass('active');
      } else {
        searchTag.removeClass('active');
      }
    }
  })
}

// 숫자만 입력
function inputNumber() {
  inputValueChk();
  var input = document.querySelector('.a-num');
  input.value = input.value.replace(/[^0-9]/g, '');
}
