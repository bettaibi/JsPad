import './scss/app.scss';
import TemplateUi from './components/templateUi';
import Playground from './components/playground';
import * as serviceWorker from './serviceWorker';

document.addEventListener('DOMContentLoaded', ()=>{
    console.log("app running...");
    window.JSHINT = JSHINT;
    const templateUi = new TemplateUi();
    // INIT TEMPLATE UI
    document.getElementById('header').innerHTML = templateUi.headerUi();
    document.getElementById('footer').innerHTML = templateUi.footerUi();
    document.getElementById('code').innerHTML = templateUi.codeUi();
    document.getElementById('preview').innerHTML = templateUi.previewUi();
    document.getElementById('console').innerHTML = templateUi.terminalUi();
    document.querySelector('[data-sidenav-container]').innerHTML = templateUi.sidenavUi();
    
    // Variables
    const zoomBtn = document.querySelector('[data-zoom]');
    const runBtn = document.querySelector('[data-run]');
    const tabs = document.querySelectorAll('.tablink');
    const openFileBtn = document.querySelectorAll('.open-file');
    const dropdown = document.getElementById('dropdown-content');
    const closeIconsBtn = document.querySelectorAll('[data-close-icon]');
    const sidenavBtn = document.querySelector('[data-sidenav-btn]');
    const layoutSetting = document.querySelectorAll('.layout-btn');
    const newProjectBtn = document.getElementById('new-project');
    const saveBtn = document.querySelector('[data-save]');
    const asideMenuBtn = document.querySelectorAll('.aside-menu');
    const removeSessionBtn = document.getElementById('btn-session-delete');
    const logoutBtn = document.querySelector('[data-logout]');
    const loginForm = document.getElementById('loginForm');
    const gobackBtn = document.getElementById('go-back');
    const themeBtn = document.querySelectorAll('.theme');

    let prevActiveBtn = 0;

    const playground = new Playground(tabs);

    // EVENT LISTNERS
    tabs.forEach((btn)=>{
        btn.addEventListener('click', (event)=>{
            event.stopPropagation();
            playground.activateWindow(btn.getAttribute('name'), btn);
        });
    });
    closeIconsBtn.forEach((icon, index)=>{
        icon.addEventListener('click', (event)=>{
            event.stopPropagation();
            playground.closeWindow(icon.parentElement.getAttribute('name'), index);
        });
    });
    openFileBtn.forEach((btn)=>{
        btn.addEventListener('click', (event)=>{
            event.stopPropagation();
            playground.openWindow(btn.getAttribute('name'));
        });
    });
    zoomBtn.addEventListener('click', ()=>{
        const prev = document.getElementById('preview');
        prev.classList.toggle('zoom-active');
    });
    
    document.getElementById('dropdown-btn').addEventListener('click', (e)=>{
        e.stopPropagation();
        playground.toggleDropdown(dropdown);
    });
    window.onclick = function(e) {
        if (dropdown.classList.contains('d-block')) {
            document.querySelector('[data-screen]').style.zIndex = 0;
            document.getElementById('code').style.zIndex = 0;
            dropdown.classList.remove('d-block');
        }
    }
    layoutSetting.forEach(btn =>{
        btn.addEventListener('click', function(e){
            e.stopPropagation();
            const attr = btn.getAttribute('name');
            const screen = document.querySelector('[data-screen]');

            if(attr==='hide-console'){
                screen.className = 'screen hide-preview';
            }
            else if(attr==='hide-preview'){
                screen.className = 'screen hide-console';
            }
            else{
                screen.className = 'screen';
            }
            setTimeout(()=>{
                playground.toggleDropdown(dropdown);
            },0);
        });
    });
    sidenavBtn.addEventListener('click', (event)=>{
        event.stopPropagation();
        playground.toggleSideBar();
    });
    document.querySelector('[data-sidenav-container]').addEventListener('click', function(){
        this.classList.toggle('d-none');
    });
    newProjectBtn.addEventListener('click', (event)=>{
        event.stopPropagation();
        playground.toggleDropdown(dropdown);
        playground.showMsg('Initialize The Project','Creating...', 'info');
        setTimeout(()=>{
            playground.newProject();
            playground.showMsg('Project Created','A new project has been created', 'success');
        },2000);
    });
    saveBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        playground.toggleDropdown(dropdown);
        playground.showSaveModal();
    });
    asideMenuBtn.forEach((btn, index) =>{
        btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            asideMenuBtn[prevActiveBtn].classList.remove('active');
            btn.classList.add('active');
            playground.showAsideContent(index);
            prevActiveBtn = index;
        });
    });
    loginForm.addEventListener('submit', function(event){
        event.preventDefault();
        let session = document.forms["loginForm"]["sessionName"].value;
        playground.login(session);
    });
    logoutBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        playground.logout();
    });
    removeSessionBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        playground.removeSession();
    });
    themeBtn.forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            for(let item of themeBtn){
                item.classList.remove('active');
            }
            btn.classList.add('active');
            const theme = btn.getAttribute('name');
            if(theme!=null)
            playground.changeTheme(theme);
        });
    });
    gobackBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        playground.toggleSideBar();
    });
    runBtn.addEventListener('click', (event)=>{
        event.stopPropagation();
        playground.runJs();
    });
    
    document.onkeyup = (e)=>{
        e.stopPropagation();
        if(e.ctrlKey && e.which == 83){
            playground.showSaveModal();
        }
    }


    // REGISTER WORKER
    serviceWorker.register();
});