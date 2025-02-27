import { createSlice} from "@reduxjs/toolkit";
import { isPending } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios'

const backendURL = process.env.REACT_APP_backend_url;

export const userThunk=createAsyncThunk('UserThunk',async(userCredObj,thunkApi)=>{
    try{

        
        if(userCredObj!=null)
            {  
                  const res=await axios.post(`${backendURL}/login`,userCredObj, {
                    headers: {
                      'Content-Type': 'application/json',
                     
                    }})
                    //(res)
                    
                  if(res.data.message==='Login successful!'){
                    
                    
                    sessionStorage.setItem('Token', res.data.token);
                const userData = JSON.stringify(res.data.user);
                localStorage.setItem('currentUser', userData);
                localStorage.setItem('loginStatus', 'true');
                //("done man!!")
                
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



export const User=createSlice(
    {
        name:"userSlice",
        initialState:{
            isPending:false,
            currentUser: JSON.parse(localStorage.getItem('currentUser')) || {},
    loginStatus: localStorage.getItem('loginStatus') === 'true',
            errorOccured:false,
            errorMessage:{},


        },
        reducers:{
            resetState:(state,action)=>{
                state.currentUser={}
                state.isPending=false
                state.loginStatus=false
                state.errorMessage={}
                state.errorOccured=false
            localStorage.removeItem('currentUser');
            localStorage.removeItem('loginStatus');
            sessionStorage.removeItem('Token');
            }
        },
        extraReducers:(builder)=>{
            builder
            .addCase(userThunk.pending,(state,action)=>{
                state.isPending=true
            })
            .addCase(userThunk.fulfilled,(state,action)=>{
                
                state.isPending=false
                state.errorOccured=false
                state.loginStatus=true
                state.errorMessage=""
                state.currentUser=action.payload

            })
            .addCase(userThunk.rejected,(state,action)=>{
                
                state.isPending=false
                state.errorOccured=true
                state.loginStatus=false
                state.errorMessage=action.payload
                state.currentUser=""
            })
        }

       
    }
)
export const {resetState}=User.actions

export default User.reducer