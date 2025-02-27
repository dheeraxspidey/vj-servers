import { createSlice} from "@reduxjs/toolkit";
import { isPending } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'
let backendURL = process.env.REACT_APP_backend_url;
//(apiUrl); // Should output: https://api.example.com
//(apiUrl,process.env)
export const PRCThunk=createAsyncThunk('PRCThunk',async(userCredObj,thunkApi)=>{
    try{
        const apiUrl = process.env.PORT;

//(apiUrl1); // Should output: https://api.example.com

//(apiUrl,process.env)
        // console.log(userCredObj,"called PRC")
       
       
        if(userCredObj!=null)
            {  
                  const res=await axios.post(`${backendURL}/login_PRC`,userCredObj, {
                    headers: {
                      'Content-Type': 'application/json',
                      // Include any other headers as needed
                    }})
                    // console.log(res)
                  if(res.data.message==='Login successful!'){
                    //use session storage for high security and also once we closed storage is deleted
                    //store in session storage and return data
                    
                    sessionStorage.setItem('Token', res.data.token);
                const userData = JSON.stringify(res.data.user);
                localStorage.setItem('currentUserPRC', userData);
                localStorage.setItem('loginStatusPRC', 'true');
                // console.log("done man!!")
                
                  }
                  else{
                    return thunkApi.rejectWithValue(res.data.error)
                  }
                return res.data.user
            }
          
    }
    catch(err){
        return thunkApi.rejectWithValue(err)
    }
})



export const PRC=createSlice(
    {
        name:"PRCSlice",
        initialState:{
            isPending:false,
            currentUser: JSON.parse(localStorage.getItem('currentUserPRC')) || {},
    loginStatus: localStorage.getItem('loginStatusPRC') === 'true',
            errorOccured:false,
            errorMessage:{},


        },
        reducers:{
            resetState1:(state,action)=>{
                state.currentUser={}
                state.isPending=false
                state.loginStatus=false
                state.errorMessage={}
                state.errorOccured=false
                localStorage.removeItem('currentUserPRC');
            localStorage.removeItem('loginStatusPRC');
            sessionStorage.removeItem('Token');
            }
        },
        extraReducers:(builder)=>{
            builder
            .addCase(PRCThunk.pending,(state,action)=>{
                state.isPending=true
            })
            .addCase(PRCThunk.fulfilled,(state,action)=>{
                
                state.isPending=false
                state.errorOccured=false
                state.loginStatus=true
                state.errorMessage=""
                state.currentUser=action.payload

            })
            .addCase(PRCThunk.rejected,(state,action)=>{
                
                state.isPending=false
                state.errorOccured=true
                state.loginStatus=false
                state.errorMessage=action.payload
                state.currentUser=""
            })
        }

       
    }
)
export const {resetState1}=PRC.actions

export default PRC.reducer