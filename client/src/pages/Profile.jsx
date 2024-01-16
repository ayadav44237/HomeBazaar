import React, { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { useRef } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../../firebase";
import { updateUserStart, updateUserFailure, updateUserSuccess, 
  deleteUserFailure, deleteUserStart, deleteUserSuccess,
signOutUserFailure, signOutUserSuccess, signOutUserStart } from "../redux/user/user.slice.js";
import { Link } from "react-router-dom";


const Profile = () => {
  const fileRef = useRef(null);
  const [userListing, setUserListing] = useState([]);
  const { currentUser,loading } = useSelector((state) => state.user.user);
  const [file, setFile] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [userSuccess, setUserSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [showListingError, setShowListingError] = useState(false);
  

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    console.log(file, "filews");
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(progress, "progress");
        setFilePerc(Math.round(progress));
      },
      (error) => {
        {
          setFileUploadError(true);
        }
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData({ ...formData, avatar: downloadURL });
        });
      }
    );
  };

  const handleChange = (e)=>{
    // console.log(formData, "formData")
    setFormData({...formData, [e.target.id]:e.target.value})
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
    console.log(currentUser,"currentUser")
    
    try{
      dispatch(updateUserStart());
      console.log(formData,"formData")
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method:'POST',
        headers:{
          'content-type':'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json();
      
      if(!data){
        dispatch(updateUserFailure(data.message));
        return;
      }
      console.log(data,"data")
      dispatch(updateUserSuccess(data));
      setUserSuccess(true);
    }
    catch(error){
      console.log("Error console")
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async ()=>{
    try{
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`,{
        method: 'DELETE',
      }
        );
        const data = await res.json();
        if(data.success === false){
          dispatch(deleteUserFailure(data.message));
          return;
        }
        dispatch(deleteUserSuccess(data))
    }
    catch(error){
      dispatch(deleteUserFailure(error.message))
    }
  }

  const handleSignOut = async ()=>{
    try{
      dispatch(signOutUserStart());
      const res = await fetch(`/api/auth/signout`);
        const data = await res.json();
        if(data.success === false){
          dispatch(signOutUserFailure(data.message));
          return;
        }
        dispatch(signOutUserSuccess(data))
    }
    catch(err){

    }
  }

  const handleShowListing = async()=>{
    try{
      setShowListingError(false);
      const  res = await fetch(`/api/user/listing/${currentUser._id}`);
      const data = await res.json();
      console.log(data,"asd")
      
      
      setUserListing(data);
      

    }
    catch(error){
      setShowListingError(error.message);
    }
  }

  const handleListingDelete = async (listingId)=>{
    try{
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method:'DELETE',
        
      });
      const data = await res.json();
      if(data.success === false){
        console.log(data.message);
        return;
      }

      setUserListing((prev)=>prev.filter((listing)=> listing._id !== listingId))
    }
    catch(err){

    }
  }

  const handleListingUpdate = ()=>{

  }
 

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4" onSubmit={(e)=>handleSubmit(e)}>
        <input
          type="file"
          onChange={(e) => {
            setFile(e.target.files[0]);
          }}
          ref={fileRef}
          hidden
          accept="image"
        />
        <img onClick={() => fileRef.current.click()} 
        src={formData?.avatar || currentUser.avatar} 
        alt="profile" 
        className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2" />
        <p className="text-sm self-center">{fileUploadError ? (<span className="text-red-700">Error Image Upload</span>) 
        : (filePerc > 0 && filePerc < 100) ? (<span className="text-slate-700">`Uploading ${filePerc}`</span>) 
        : filePerc === 100 ? (<span className="text-green-700">Image Upload Successfully</span>) 
        : ""}</p>
        <input type="text" placeholder="username" id="username" defaultValue={currentUser.username} onChange={handleChange}  className="border p-3 rounded-lg" />
        <input type="email" placeholder="email" id="email" defaultValue={currentUser.email}  onChange={handleChange} className="border p-3 rounded-lg" />
        <input type="password" placeholder="password" id="password" onChange={handleChange}  className="border p-3 rounded-lg" />
        <button disabled={loading} className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95">{loading?"Loading...": "Update"}</button>
        <Link to={'/create-listing'} className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95">Create Listing</Link>
      </form>
      <div className="flex justify-between mt-5 mx-2">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
      <div className="flex justify-content-between mt-5 mx-2">
        <span className="text-green-700">{userSuccess && "Upload data Successfully"}</span>
      </div>
      <button onClick={handleShowListing} className="text-green-700 w-full">Show Listing</button>
      <p className="text-red-700 mt-5">{showListingError ? 'Error showing Listing' : ''}</p>
      {
        userListing && userListing.length>0 && 
        (
          <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">Your Listing</h1>
       { userListing.map((listing)=>(
          <div className="border rounded-lg p-3 flex justify-between items-center gap-4" key={listing._id}>
            <Link to={`/listing/${listing._id}`}>
              <img src={listing.imageUrls[0]} alt="listing cover" className="h-16 w-16 object-contain" />
            </Link>
            <Link to={`/listing/${listing._id}`}>
              <p className="text-slate-700 font-semibold flex-1 hover:underline truncate">{listing.name}</p>
            </Link>
            <div className="flex flex-col item-center">
              <button onClick={()=>handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
              <Link to={`/update-listing/${listing._id}`}>
                <button onClick={()=>handleListingUpdate(listing._id)} className="text-green-700 uppercase">Edit</button>
              </Link>
            </div>
            
          </div>
        ))}</div>)
      }   
    </div>
  );
};

export default Profile;
