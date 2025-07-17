import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email,password) => {
    try{
        const res = await axios({
            method : 'POST',
            url : 'http://127.0.0.1:3000/api/v1/users/login',
            data : {
                email,
                password,
            }
        })
        console.log(res);
        if(res.data.status === 'success'){
            showAlert('success','Logged in successfull !');
            window.setTimeout(() => {
                location.assign('/');
            },5000);
        }
    }catch(err){
        showAlert('error',err.response.data.message);
    }
    
}


export const logout = async () => {
    try{
        const res = await axios({
            method : "GET",
            url : 'http://127.0.0.1:3000/api/v1/users/logout',
        })
        console.log('hello');
        if(res.data.status === 'success') location.reload(true);
    } catch(err){
        console.log('hello2')
        console.log(err);
        showAlert('error','Error logging out ! Try again.')
    }
}