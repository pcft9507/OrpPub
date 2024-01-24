let sampleDropdown;
let searchDropDown;
let layerModal;
class GuideFunc {
  constructor(data) {
    this.items = data;
    this.gnb = document.querySelector('.guide__header__gnb');
    this.gnbMenu = this.gnb.querySelectorAll('button');
    this.container = document.querySelector('.guide__container')
    this.colorChip = document.querySelectorAll('.colorChip');
    this.ifr = null;
    this.update = null;
    this.titleArry = [];
    this.getUrlParams = () => {
      let params = {}
      window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (str, key, value) => { params[key] = value });
      return params;
    }
    this.init();
  }
  init() {
    this.chkDevive();
    this.gnbSet();
    this.colorEvent();
    this.container.addEventListener('mouseenter', ()=>{
      if(this.ifr != null) {
        this.ifr.remove();
        this.ifr = null;
      }
    });
  }
  dialog(str) {
    const temp = document.createElement('div');
    temp.classList.add('guide__dialog');
    temp.innerText = str;
    document.body.insertAdjacentElement('beforeend', temp);
    setTimeout(()=>{
      temp.remove();
    },2000);
  }
  colorEvent() {
    for(let idx = 0; idx < this.colorChip.length ; idx++ ) {
      this.colorChip[idx].addEventListener('click', _this=>{
        let input = document.createElement('input');
        document.body.insertAdjacentElement('beforeend', input);
        input.value = _this.target.dataset.var;
        input.select();
        document.execCommand("Copy");
        input.remove();
        this.dialog(`copyed : ${_this.target.dataset.var}`);
      });
    }
  }
  chkDevive() {
    (navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i))
    ? document.body.classList.add('mo')
    : document.body.classList.remove('mo');
  }
  gnbSet() {
    const active = page => {
      [].forEach.call(this.gnbMenu, _this => {
        _this.classList.remove('active');
      });
      [].forEach.call(this.gnbMenu, _this => {
        if(_this.dataset.page == page) _this.classList.add('active');
      });
      ajax(page);
      history.pushState({'name': page},'','index.html?page='+page);
    };
    window.addEventListener('popstate', e => ajax(e.state.name));
    const ajax = (page)=>{
      this.container.innerHTML = '';
      const httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = (e) => {
        if(e.target.readyState == 4 && e.target.status == 200) {
          this.container.innerHTML = e.target.responseText;
          let scriptTags = this.container.getElementsByTagName('script');
          switch (page) {
            case 'guide_filelist' :
              this.createTemplate();
            break;
            default : 
              document.querySelectorAll(".language-html").forEach(function(element) {
                element.innerHTML = element.innerHTML.replace(/&/g, "&amp;").replace(/</g, "&lt;");
              });
              if(scriptTags.length) {
                sampleDropdown = new GlobalSetObj('dropdown');
                for(let idx = 0 ; idx < scriptTags.length ; idx++) {
                  eval(scriptTags[idx].innerHTML);
                }
              }
              hljs.highlightAll();
            break;
          }
          let sections = this.container.querySelectorAll('.guide__section');
          let foldState = [];
          if(localStorage.getItem(page)) {
            const state = localStorage.getItem(page).split(',');
            sections.forEach((_this, idx)=>{
              if(state[idx] === "1") _this.classList.add('fold');
            })
          }
          this.container.querySelectorAll('.btnFold').forEach(btn=>{
            btn.addEventListener('click',()=>{
              btn.closest('section').classList.toggle('fold');
              foldState = [];
              sections.forEach(_this=>{
                (_this.classList.contains('fold')) ? foldState.push("1") : foldState.push("0");
              });
              localStorage.setItem(page, foldState);
            });
            btn.addEventListener('dblclick',()=>{
              foldState = [];
              sections.forEach(_this=>{
                _this.classList.add('fold');
                foldState.push("1");
              });
              localStorage.setItem(page, foldState);
            });
          });
        }
      }
      httpRequest.open('GET', `./guide/${page}.html`, true);
      httpRequest.send();
    };
    if(this.getUrlParams().page) active(this.getUrlParams().page);
    [].forEach.call(this.gnbMenu, function(link){
      link.addEventListener('click', function(){
        active(this.dataset.page);
      });
    });
  }
  createTemplate() {
    this.items.map(element=>{
      const fileList = document.querySelector('[data-ref="fileList"]');
      const section = document.createElement('section');
      section.classList.add('guide__section');
      const template = `
        <h2 class="guide__subTit">${element.title} <button type="button" class="btnFold">접기</button></h2>
        <div class="guide__table">
        <table>
          <colgroup>
            <col style="width:12%;">
            <col style="width:12%;">
            <col style="width:12%;">
            <col style="width:12%;">
            <col>
            <col style="width:100px;">
            <col style="width:100px;">
            <col>
          </colgroup>
          <thead>
            <tr>
              <th scope="col">1depth</th>
              <th scope="col">2depth</th>
              <th scope="col">3depth</th>
              <th scope="col">4depth</th>
              <th scope="col">url</th>
              <th scope="col">date</th>
              <th scope="col">update</th>
              <th scope="col">etc</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      `;
      section.innerHTML = template;
      fileList.insertAdjacentElement('beforeend',section);
      this.titleArry.push(element.title);
      this.createSubTemplate(section.querySelector('tbody'), element.list);
    });
  }
  createSubTemplate(target, item) {
    item.map(element=>{
      const tr = document.createElement('tr');
      const template = `
        <td>${element.dep1 ? element.dep1 : ''}</td>
        <td>${element.dep2 ? element.dep2 : ''}</td>
        <td>${element.dep3 ? element.dep3 : ''}</td>
        <td>${element.dep4 ? element.dep4 : ''}</td>
        <td class="url"><a href="${element.url ? element.url : ''}" target="_blank">${element.name ? element.name : ''}</a></td>
        <td class="date" style="text-align:center;">${element.status ? element.status : ''}</td>
        <td class="update" style="text-align:center;"></td>
        <td class="etc"></td>
      `;
      tr.innerHTML = template;
      if(element.state) {
        if(element.state.split(',').length > 1) {
          for(let stateIdx = 0; stateIdx < element.state.split(',').length ; stateIdx++) {
            tr.classList.add(element.state.split(',')[stateIdx]);
          }
        } else {
          tr.classList.add(element.state);
        }
      }
      // this.qrSet(tr.querySelector('.url'), tr.querySelector('.url a').href)
      if(element.update) this.makeUpdate(tr.querySelector('.update'), element.update);
      if(element.etc) this.makeEtc(tr.querySelector('.etc'), element.etc);
      // tr.addEventListener('mouseenter',()=>{
      //   if(!document.body.classList.contains('mo') && url.indexOf('work_sheet') < 0) {
      //     this.showTempIfr(url);
      //   } else if(url.indexOf('work_sheet') > 0 && this.ifr != null) {
      //     this.ifr.remove();
      //     this.ifr = null;
      //   }
      // })
      target.insertAdjacentElement('beforeend', tr);
    });
  }
  qrSet(target, url) {
    if(url.match('.me')) {
      const split = url.split('.me');
      url = `${split[0]}.me:1080${split[1]}`;
    }
    const googleQr = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl='+url+'&choe=UTF-8';
    const qrBox = document.createElement('div');
    qrBox.innerHTML = `<img src="${googleQr}" style="width: 150px; height: 150px;">`
    qrBox.classList.add('qrBox');
    target.insertAdjacentElement('beforeend', qrBox);
  }
  showTempIfr(src) {
    if(this.ifr != null) this.ifr.remove();
    this.ifr = document.createElement('div');
    this.ifr.style.cssText = `position: fixed; top: 0; right: 0; bottom: 0; background: #fff; z-index: 100;`;
    this.ifr.innerHTML = `<iframe src="${src}" style="width: 100%; height: 100%; border: none;">`
    this.ifr.hidden = true;

    this.ifrReszie(this.ifr);
    document.body.insertAdjacentElement('beforeend', this.ifr);
    this.ifr.querySelector('iframe').contentWindow.addEventListener('DOMContentLoaded', e=>{
      e.target.body.insertAdjacentHTML('beforeend', '<style>*::-webkit-scrollbar {display: none;}</style>');
      this.ifr.hidden = false;
    })
  }
  ifrReszie(target) {
    let defaultSize = 360;
    let deltaSize = 360;
    let deltaX = 0;
    let maskEl = null;
    let numEl = null;

    const trigger = document.createElement('div');
    trigger.style.cssText = `position: absolute; top: 0; bottom: 0; left: -8px; width: 8px; background: #333; cursor: col-resize;`
    this.ifr.insertAdjacentElement('beforeend', trigger);

    const resizeState = {
      get val() {
        return this._state;
      },
      set val(bool) {
        this._state = bool;
        if(bool) {
          makeMaskEl();
        } else {
          maskEl.remove();
          maskEl = null;
        }
      }
    }

    const makeMaskEl = ()=>{
      maskEl = document.createElement('div');
      maskEl.style.cssText = `position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 100; cursor: col-resize;`;
      maskEl.addEventListener('mousemove', funcResize);
      maskEl.addEventListener('mouseup', ()=>{
        resizeState.val = false;
        defaultSize = deltaSize;
        numEl.remove();
      });
      document.body.insertAdjacentElement('beforeend', maskEl);
    }

    target.style.width = `${defaultSize}px`;

    const funcResize = e=>{
      deltaSize = deltaX - e.clientX + defaultSize;
      target.style.width = `${deltaSize}px`;
      numEl.innerText = deltaSize;
    }
    
    trigger.addEventListener('mousedown', e=>{
      numEl = document.createElement('span');
      numEl.style.cssText = `position: absolute; top: 10px; left: 50%; padding: 0 5px; transform: translateX(-50%); background: #666; color: #fff;`;
      numEl.innerText = deltaSize;
      this.ifr.insertAdjacentElement('beforeend', numEl);
      deltaX = e.clientX;
      resizeState.val = true;
    });

  }
  makeUpdate(target, item) {
    const dl = document.createElement('dl');
    const btn = document.createElement('button');
    btn.innerText = item[0].date;
    item.forEach(_this=>{
      dl.insertAdjacentHTML('beforeend', `<dt>${_this.date}</dt>`);
      dl.insertAdjacentHTML('beforeend', `<dd>${_this.txt}</dd>`);
    })
    target.insertAdjacentElement('beforeend', btn);
    btn.addEventListener('click', ()=>{
      this.showUpdate(dl);
    });
  }
  makeEtc(target, item) {
    const ul = document.createElement('ul');
    item.forEach(_this=>{
      ul.insertAdjacentHTML('beforeend', `<li>${_this}</li>`);
    })
    target.insertAdjacentElement('beforeend', ul);
  }
  showUpdate(dl) {
    const layer = document.createElement('div');
    layer.classList.add('guide__layer__update');
    layer.innerHTML = '<button type="button" class="btnClose">닫기</button>';
    layer.insertAdjacentElement('beforeend', dl);
    layer.querySelector('.btnClose').addEventListener('click', ()=>layer.remove());
    document.body.insertAdjacentElement('beforeend', layer);
  }
}

