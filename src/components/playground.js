import { jsDoc, htmlDocument, cssDoc } from './variables';
import ConsoleUi from './console';
import Database from './database';
import CodeMirror from 'codemirror';
import folderIcon from '../img/icons/folder-open.svg';
import trashIcon from '../img/icons/trash.svg';
import downloadIcon from '../img/icons/download.svg';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/trailingspace';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/jump-to-line';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/matchesonscrollbar';
import 'codemirror/addon/search/match-highlighter';
import 'codemirror/addon/scroll/annotatescrollbar';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/xml-hint';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/selection/selection-pointer';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/keymap/sublime';
import 'codemirror/addon/lint/css-lint';
import 'codemirror/addon/lint/javascript-lint';
import 'codemirror/addon/lint/lint';
import emmet from '@emmetio/codemirror-plugin';
emmet(CodeMirror);

class Playground{

    constructor(tabs){
        this.tabs = tabs;
        this.tabsContent = document.querySelectorAll('.tabcontent');
        this.asideWindows = document.querySelectorAll('[data-tab]');
        this.savedProjects = document.querySelector('[data-recently-saved-area]');
        this.toDownloadProjects = document.querySelector('[data-download-area]');
        this.sessionId = document.getElementById('sessionId');
        this.consoleUi = new ConsoleUi();
        this.db = new Database();
        this.appInit();
        this.getData();
    }

    appInit(){
        this.showAsideContent(0);
        this.myDocument = undefined;
        this.modal = undefined;
        this.currentProject = {
            id: undefined, 
            name: undefined,
            js: jsDoc.trim(),
            html: htmlDocument.trim(),
            css: cssDoc.trim(),
            userId: localStorage.getItem('uid')
        };
        this.images = [];
        const options = {
            theme: 'dracula',
            lineNumbers: true,
            lineWrapping: true,
            autoCloseBrackets: true,
            enableSearchTools: true,
            enableCodeFormatting: true,
            autoFormatOnStart: true,
            autoFormatOnModeChange: true,
            autoFormatOnUncomment: true,
            showTrailingSpace: true,
            highlightMatches: true,
            highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
            showFormatButton: true,
            keyMap: 'sublime',
            readOnly: false,
            showCursorWhenSelecting: true,
            autoCloseTags: true,
            matchBrackets: true,
            extraKeys: {"Ctrl-Space": "autocomplete"},
            styleActiveLine: true,
        };
        document.getElementById('html-code').innerHTML = this.currentProject.html.trim();
        document.getElementById('js-code').innerHTML = this.currentProject.js.trim();
        document.getElementById('css-code').innerHTML = this.currentProject.css.trim();

        this.htmlConfig = CodeMirror.fromTextArea(document.getElementById('html-code'), {
            ...options,
            mode: 'htmlmixed',
            gutters: ["CodeMirror-lint-markers"],
            lint: true,
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                'Tab': 'emmetExpandAbbreviation',
                'Esc': 'emmetResetAbbreviation',
                'Enter': 'emmetInsertLineBreak'
            },
            emmet: {
                mark: true,
                markTagPairs: true,
                previewOpenTag: true,
                autoRenameTags : true,
                markupStyle : 'html'
            }
        });

        this.jsConfig = CodeMirror.fromTextArea(document.getElementById('js-code'), {
            ...options,
            mode: 'javascript',
            gutters: ["CodeMirror-lint-markers"],
            lint: {
                esversion: 6
            }
        });
        
        this.cssConfig = CodeMirror.fromTextArea(document.getElementById('css-code'), {
            ...options,
            mode: 'css',
            gutters: ["CodeMirror-lint-markers"],
            lint: true
        });

        this.jsConfig.on("keydown", function (cm, event) {
            if (
              !(event.ctrlKey) &&
              (event.keyCode >= 65 && event.keyCode <= 90) || 
              (event.keyCode >= 97 && event.keyCode <= 122) || 
              (event.keyCode >= 46 && event.keyCode <= 57)
            ) {
              CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
            }
          });

          this.cssConfig.on("keydown", function (cm, event) {
            if (
              !(event.ctrlKey) &&
              (event.keyCode >= 65 && event.keyCode <= 90) || 
              (event.keyCode >= 97 && event.keyCode <= 122) || 
              (event.keyCode >= 46 && event.keyCode <= 57)
            ) {
              CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
            }
          });

        // CONFIG TABS
        this.buildTabs();

        this.onContentChange();
        this.updatePreview();

    }

    buildTabs(){
        this.tabsContent.forEach((item, i)=>{
            if(this.tabs[i].getAttribute('name') === 'welcome'){
                this.tabs[i].className = "tablink active d-block";
                item.className = "tabcontent d-block"
            }
            else if(this.tabs[i].getAttribute('name') === 'js'){
                item.className = "tabcontent d-none";
                this.tabs[i].classList.remove('active');
            }
            else{
                this.tabs[i].className = "tablink d-none";
                item.className = "tabcontent d-none";
                this.tabs[i].classList.remove('active');
            }
        });
    }

    onContentChange(){
        this.htmlConfig.on('change', (event)=>{
            this.currentProject.html =  event.getValue();
            this.updatePreview();
        });

        this.jsConfig.on('change', (event)=>{
            this.currentProject.js =  event.getValue();
            this.updatePreview();
        });

        this.cssConfig.on('change', (event)=>{
            this.currentProject.css =  event.getValue();
            this.updatePreview();
        });
    }

    async updatePreview(){
        const options = `
        document.querySelectorAll('a').forEach((tag)=>{
            tag.target = '_blank';
            tag.onclick = function(e){
                e.stopPropagation();
                window.open(a.href, "_blank")
            } 
        });
        `;
        let newDoc = await this.normalizeHtml(this.currentProject.html);
        this.myDocument = `${newDoc.trim()} <style>${this.currentProject.css.trim()}</style>`;
        const preview = document.querySelector('#iframe-preview').contentWindow.document;
        preview.open();
        preview.write(`${this.myDocument}<script>${options}</script>`);
        preview.close();
    }

    async normalizeHtml(html){
     try{
        let newDoc = html.trim();
        for (let item of this.images){
            newDoc = newDoc.replace(`${item.name}`, `${item.data}`);
        }
        return newDoc;
     }
     catch(err){
        throw err;
     }
    }

    runJs(){
        this.consoleUi.executeCode(this.currentProject.js, this.myDocument);
    }

    setTabs(){
        this.tabsContent.forEach((item, i)=>{
            item.className = "tabcontent d-none";
            this.tabs[i].classList.remove('active');
        });
    }

    activateWindow(id, btn){
        this.setTabs();
        btn.classList.add('active');
        document.getElementById(id).className = "tabcontent d-block";
    }

    openWindow(id){
        const btn = document.getElementById(id+'window');
        btn.classList.remove('d-none');
        this.activateWindow(id, btn);
    }

    closeWindow(id, index){
        document.getElementById(id).className = "tabcontent d-none";
        document.getElementById(id+'window').className = "tablink d-none";
        if(index > 0 && !this.tabs[index -1].classList.contains('d-none')){
            this.openWindow(this.tabs[index -1].getAttribute('name'));
            return;
        }
        if(!this.tabs[index +1]?.classList.contains('d-none')){
            this.openWindow(this.tabs[index +1].getAttribute('name'));
        }
    }

    toggleDropdown(dropdown){
        let screen = document.querySelector('[data-screen]');
        let code = document.getElementById('code');
        if(dropdown.classList.contains('d-block')){
            screen.style.zIndex = 0;
            code.style.zIndex = 0
            dropdown.classList.remove('d-block');
        }
        else{
            screen.style.zIndex = -1;
            code.style.zIndex = -1;
            dropdown.classList.add('d-block');
        }
    }

    toggleSideBar(){
        document.querySelector('[data-sidenav-container]').classList.toggle('d-none');
    }

    newProject(){
        this.jsConfig.setValue(jsDoc.trim());
        this.htmlConfig.setValue(htmlDocument.trim());
        this.cssConfig.setValue(cssDoc.trim());
        this.currentProject = {
            id: undefined, 
            name: undefined,
            js: jsDoc.trim(),
            html: htmlDocument.trim(),
            css: cssDoc.trim(),
            userId: localStorage.getItem('uid')
        };
        this.buildTabs();
    }

    showMsg(title, message, type){
        const toast = document.createElement('div');
        toast.className = `toast shadow-sm ${type}`;
        toast.innerHTML = `
            <div class="title">${title}</div>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(()=>{
            toast.remove();
        },4000);
    }

   async showModal(template){
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal shadow-sm" id="modal">
                ${template}
            </div>
        `;
        document.body.appendChild(this.modal);
        setTimeout(()=>{
            if(this.currentProject.name){
                document.forms["projectForm"]["projectName"].value = this.currentProject.name;
            }
            document.getElementById('save-btn').addEventListener('submit', (e)=>{
                e.preventDefault();
                const name = document.forms["projectForm"]["projectName"].value;
                this.saveProject(name).then(()=>{
                    this.modal.remove();
                });
            });
            this.modal.onclick = ()=>{
                this.modal.remove();
            };
            document.getElementById('modal').addEventListener('click', (e)=>{
                e.stopPropagation();
            });
        },200);
    }

    initAside(){
        for(let item of this.asideWindows){
            item.classList.add('d-none')
        }
    }

    showAsideContent(index){
        this.initAside();
        setTimeout(()=>{
            this.asideWindows[index].classList.remove('d-none');
        },0);
    }

    set setProjectId(id){
        this.currentProject.id = id;
    }

    set setProjectName(name){
        this.currentProject.name = name;
    }

    set setCurrentProject(project){
        this.currentProject = project;
    }

    // Login to a Session
    async login(name){
        await this.db.createUserSession(name);
        this.showMsg('Session Management', 'Welcome to your session', 'success');
        await this.getData();
    }

    addToList(item){
        this.savedProjects.innerHTML += `
        <tr>
            <td>${item.name}</td>
            <td class="icon">
                <button class="delete-icon" data-project-id=${item.id}>
                    <img src=${trashIcon}>
                </button>
            </td>
            <td class="icon">
                <button class="open-icon" data-project-id=${item.id}>
                    <img src=${folderIcon}>
                </button>
            </td>
        </tr>
        `;

        this.toDownloadProjects.innerHTML += `
        <tr>
            <td>${item.name}</td>
            <td class="icon">
                <button class="download-icon" data-project-id=${item.id}>
                    <img src="${downloadIcon}">
                </button>
            </td>
        </tr>
        `;
    }

    async getProjects(uid){
        this.savedProjects.innerHTML = "";
        this.toDownloadProjects.innerHTML = "";
        let projects = [...await this.db.getProjects()];
        projects = projects.filter((item)=>{return item.userId === uid});
        if(projects){
            for(let item of projects){
                this.addToList(item)
            }

            document.querySelectorAll('.open-icon').forEach((btn, i)=>{
                btn.addEventListener('click', (e)=>{
                    e.stopPropagation();
                    const id = btn.dataset.projectId;
                    this.openProject(id);
                });
            });

            document.querySelectorAll('.delete-icon').forEach((btn, i)=>{
                btn.addEventListener('click', (e)=>{
                    e.stopPropagation();
                    const id = btn.dataset.projectId;
                    const res = confirm("Are you sure you want to delete this project?");
                    if(res){
                        this.deleteProject(id, i);
                    }
                });
            });

            
            document.querySelectorAll('.download-icon').forEach((btn, i)=>{
                btn.addEventListener('click', (e)=>{
                    e.stopPropagation();
                    const id = btn.dataset.projectId;
                    this.downloadFile(id);
                });
            });
        }
    }

    // Get USER DATA
    async getData(){
        const removeSessionBtn = document.getElementById('btn-session-delete');
        const logoutBtn = document.querySelector('[data-logout]');
        const createSessionBtn = document.querySelector('[data-create-session-btn]');
        const user = await this.db.getCurrentUser();
        if(user){
            this.sessionId.innerText = user.uid.slice(0, 20)+'...';
            document.body.className = user.theme;
            document.forms["loginForm"]["sessionName"].value = user.name;
            logoutBtn.disabled = false
            removeSessionBtn.disabled = false;
            createSessionBtn.disabled = true
            this.currentProject.userId = user.uid;

            await this.getProjects(user.uid);
        }
        else{
            this.sessionId.innerText = "None";
            document.forms["loginForm"]["sessionName"].value = "";
            this.toDownloadProjects.innerHTML = '';
            this.savedProjects.innerHTML = '';
            this.currentProject.userId = undefined;
            logoutBtn.disabled = true
            removeSessionBtn.disabled = true;
            createSessionBtn.disabled = false;
        }
    }
    

    // Logout from session
    async logout(){
        localStorage.clear();
        await this.getData();
        this.showMsg('Session closed', 'your session has been closed', 'info');
    }

    // REMOVE A SESSION
    async removeSession(){
       await this.db.deleteMySession();
       this.showMsg('Session removed', 'your session has been removed', 'danger');
       await this.getData();
    }

    async saveProject(name){
        if(!localStorage.getItem('uid')){
            this.showMsg('Project Not Saved', 'You should connect to a session to be able to save your progess;','danger');
        }
        else{
            const state = this.currentProject.id?'edit':'new';
            const res = await this.db.saveProject(name, this.currentProject, this.images);
            this.setProjectId = res.newId;
            this.setProjectName = res.name;
            this.showMsg('Project Saved', 'Your progress has been saved', 'success');
            if(state === 'new'){
                this.addToList({name: this.currentProject.name, id: this.currentProject.id});
            }
            else{
               await this.getProjects(this.currentProject.userId);
            }
            
        }
    }

    async openProject(id){
        const res = await this.db.getProjectById(id);
        if(res){
            this.toggleSideBar();
            this.images = res.images;
            this.setCurrentProject = res;
            this.jsConfig.setValue(res.js);
            this.htmlConfig.setValue(res.html);
            this.cssConfig.setValue(res.css);
            this.openWindow('js');
            this.openWindow('html');
            this.openWindow('css');
            this.showMsg('Project opened', 'A project has been opened', 'success');
        }
    }

    deleteProject(id, index){
        this.db.deleteProject(id).then(()=>{
            this.showMsg('Project Deleted', 'A project has been deleted', 'success');
            this.savedProjects.children[index].remove();
        }).catch(err=> console.error(err));
    }

   async downloadFile(id){
        const res = await this.db.getProjectById(id);
        var htmlContent =  `${res.html}<style>${res.css}</style><script>${res.js}</script>`;

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));
        element.setAttribute('download', res.name+'.html');
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);
    }

    async changeTheme(theme){
        if(localStorage.getItem('uid')){
            await this.db.updateTheme(theme);
        }
       document.body.className = theme;
    }

    showSaveModal(){
        const content = `
        <form id="save-btn" name="projectForm">
            <div class="form-group" style="padding:0 !important;">
                <label for="name">Save your progress</label>
                <input name="projectName" style="margin: 1rem 0;" type="text" id="nale"
                required class="form-control" placeholder="Enter project name" autocomplete="off">
            </div>
            <input type="submit" value="SAVE">
        </form>`;
        this.showModal(content);
    }

    async getFiles(files){
        this.showMsg('Done', 'Images have been selected', 'success');
        if(files){
            for(let file of files){
              await  this.imageStream(file);
            }
        }
    }

    async imageStream(file){
        var reader = new FileReader();
        reader.onload = ()=>{
          var dataURL = reader.result;
          this.images = [...new Set([...this.images, {name: file.name, data: dataURL}])];
        };
        
        reader.readAsDataURL(file);
    }


}

export default Playground;