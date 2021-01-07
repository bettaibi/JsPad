
class ConsoleUi{

    constructor(){
        this.view = document.querySelector('[data-terminal]');
        this.init();
    }
  
    init(){
          const app = this;
          (function(){
              console.log = function (message) {
                  app.updateView({content: message, type:'log'});
              };
              console.error = function (message) {
                  app.updateView({content: message, type:'error'});
              };
              console.warn = function (message) {
                  app.updateView({content: message, type:'warn'});
              };
              console.info = function (message) {
                  app.updateView({content: message, type:'info'});
              };
              console.dir = function(item){
                  app.updateView({content: item, type:'log'});
              };
              console.clear = function(){
                  app.view.innerHTML = '';
              };
          })();
    }

    normalizeOutput(obj){
        if(obj instanceof Array){
            return `[${obj}]`;
        }
        else if(obj instanceof Object){
            return JSON.stringify(obj);
        }
        else return obj;
    }

    clear(){
      let res = new Function('"use strict"; console.clear()');
      res();
    }

    updateView(data){
        const content = this.normalizeOutput(data.content)
        switch(data.type){
            case 'log': this.view.innerHTML += `<a>${content}</a>`; break;
            case 'info': this.view.innerHTML += `<a class="info">Info: ${content}</a>`; break;
            case 'warn': this.view.innerHTML += `<a class="warn">Warning: ${content}</a>`; break;
            case 'error': this.view.innerHTML += `<a class="error">Error: ${content}</a>`; break;
            default: return;
        }
    }

    executeCode(jsDoc, myDocument){
        try{
            this.clear();
            const options = `
            document.querySelectorAll('a').forEach((tag)=>{
                tag.target = '_blank';
                tag.onclick = function(e){
                    e.stopPropagation();
                    window.open(a.href, "_blank")
                } 
            });
            `;
            const preview = document.querySelector('#iframe-preview').contentWindow.document;
            preview.open();
            preview.write(`${myDocument}<script>${jsDoc} ${options}</script>`);
            preview.close();
            const res = new Function('"use strict;"'+jsDoc);
            res();
        }
        catch(err){
            this.updateView({content: err.message, type:'error'});
        }
    }
}

export default ConsoleUi;
