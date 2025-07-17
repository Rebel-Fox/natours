import axios from "axios";
import { showAlert } from "./alerts";

export const booktour = async tour => {
    try{
        const res = await axios({
            method:'POST',
            url : 'http://127.0.0.1:3000/api/v1/bookings/book-tour',
            data : {
                tour,
            }
        })
        console.log(res);
        if(res.data.status === 'success'){
            showAlert('success','Tour Booked successfully !');
            window.setTimeout(() => {
                location.assign('/');
            },5000);
        }
    }catch(err){
        showAlert('error',err.response.data.message);
    }
    
}