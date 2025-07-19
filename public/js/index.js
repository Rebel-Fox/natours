import { login, logout, signup } from "./login";
import { displayMap } from "./leaflet";
import { updateSettings } from "./updateSettings";
import { booktour } from "./booktour";

const mapBox = document.getElementById('map');

const logoutBtn = document.querySelector('.nav__el--logout');

if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

const signupForm = document.querySelector('.form-user-signup');
if(signupForm){
    signupForm.addEventListener('submit',e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signup(name,email,password,passwordConfirm);
    })
}

const loginForm = document.querySelector('.form-user-login');
//console.log(loginForm);
if(loginForm){
    loginForm.addEventListener('submit',e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password);
    })
}


if(logoutBtn){
    logoutBtn.addEventListener('click',e => {
        e.preventDefault();
        //console.log('btn clicked');
        logout();
    })
}

const userDataForm = document.querySelector('.form-user-data');
if(userDataForm){
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name',document.getElementById('name').value);
        form.append('email',document.getElementById('email').value);
        form.append('photo',document.getElementById('photo').files[0]);
        //console.log(form);
        updateSettings(form,'data');
    })
}

const userPasswordForm =  document.querySelector('.form-user-password');
if(userPasswordForm){
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...'
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent,password,passwordConfirm},'password');
        document.getElementById('password-current').val = '';
        document.getElementById('password').val = '';
        document.getElementById('password-confirm').val = '';
        document.querySelector('.btn--save-password').textContent = 'Save Password'
    })
}

const bookBtn = document.getElementById('book-tour');
if(bookBtn){
    bookBtn.addEventListener('click',async (e) => {
        e.preventDefault();
        const tour = bookBtn.dataset.tour;
        bookBtn.innerText = 'Booking...'
        await booktour(tour);
        bookBtn.innerText = 'Book tour now'
    })
}