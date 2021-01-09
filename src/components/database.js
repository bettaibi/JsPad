import { v4 as uuidv4 } from 'uuid';
import Localbase from 'localbase';

class Database{

    constructor(){
        this.onInit();
    }

    onInit(){
        const INDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        if (!INDB) {
            alert("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
            return;
        }

        this.db = new Localbase('js-pad');
        this.db.config.debug = false

    }

    async getCurrentUser(){
        try{
            if(localStorage.getItem('uid')){
                const uid = localStorage.getItem('uid');
                let result = await this.db.collection('users')
                .doc({ uid: uid }).get();
                return result;
            }
            else{
               return undefined;
            }
        }
        catch(err){
            console.error(err);
        }
    }

    async createUserSession(name){
        try{
            let result = await this.db.collection('users')
            .doc({ name: name }).get();

            if(result){
                localStorage.setItem('uid', result.uid);
            }
            else{
                const uid = uuidv4();
                localStorage.setItem('uid', uid);
                this.db.collection('users').doc(uid).set({
                    uid: uid,
                    name: name,
                    theme: 'default-theme'
                });
            }
        }
        catch(err){
            console.error(err);
        }
    }

    async updateTheme(color){
        try{
            const uid = localStorage.getItem('uid');
            let res = await this.db.collection('users').doc({ uid: uid }).update({
                theme: color
            });
        }
        catch(err){
            console.error(err)
        }
    }

    // Project:  name, content(js, html, css), userId, project id, 
    async saveProject(name, currentProject, images){
        try{
           const uid = localStorage.getItem('uid');
           const projectId = currentProject.id?currentProject.id:uuidv4();
           
           const result = await this.db.collection('projects').doc(projectId).set({
            id: projectId, 
            name: name,
            js: currentProject.js,
            html: currentProject.html,
            css: currentProject.css,
            userId: uid,
            images: images
          });
          return {result: result, newId: projectId, name: name};
        }
        catch(err){
            console.error(err);
        }
    }

    async getProjectById(id){
        try{
           return await this.db.collection('projects').doc({ id: id }).get();
        }
        catch(err){
            console.log(err)
        }
    }

    async getProjects(){
        try{
            const uid = localStorage.getItem('uid');
            return await this.db.collection('projects').get();
        }
        catch(err){
            console.error(err);
        }
    }

    async deleteProject(id){
        try{
            return await this.db.collection('projects').doc({ id: id }).delete();
        }
        catch(err){
            console.error(err)
        }
    }

    logout(){
        localStorage.clear();
    }

    async deleteMySession(){
        const uid = localStorage.getItem('uid');
        if(uid){
          await  this.db.collection('projects').doc({ userId: uid }).delete();
          await  this.db.collection('users').doc(uid).delete();
          localStorage.clear();
        }
    }

    dropDb(){
        this.db.delete();
    }

}

export default Database;