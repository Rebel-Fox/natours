import axios from "axios";
import { showAlert } from "./alerts";

//type is either passoword or data
export const updateSettings = async (data,type) => {
    let url;
    if(type === 'password'){
        url = `http://127.0.0.1:3000/api/v1/users/updateMyPassword`
    }else{
        url = `http://127.0.0.1:3000/api/v1/users/updateMe`
    }
    try{
        const res = await axios({
            method:"PATCH",
            url ,
            data
        })

        console.log(res);
        if(res.data.status === 'success'){
            showAlert('success',`${type.toUpperCase()} Updated Successfully !`);
            window.setTimeout(() => {
                location.assign('/me');
            },5000)
        }
        
    }catch(err){
        console.log(err);
        showAlert('error',err.response.data.message);
    }
}